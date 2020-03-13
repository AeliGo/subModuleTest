import cledit from './cleditCore';
var DiffMatchPatch = require('diff-match-patch');

function UndoMgr(editor) {
  cledit.Utils.createEventHooks(this);

  /* eslint-disable new-cap */
  var diffMatchPatch = new DiffMatchPatch();
  /* eslint-enable new-cap */

  var self = this;
  var selectionMgr;
  var undoStack = [];
  var redoStack = [];
  var currentState;
  var previousPatches = [];
  var currentPatches = [];
  var debounce = cledit.Utils.debounce;

  self.options = {
    undoStackMaxSize: 200,
    bufferStateUntilIdle: 1000,
    patchHandler: {
      makePatches: function(oldContent, newContent, diffs) {
        return diffMatchPatch.patch_make(oldContent, diffs);
      },
      applyPatches: function(patches, content) {
        return diffMatchPatch.patch_apply(patches, content)[0];
      },
      reversePatches: function(patches) {
        patches = diffMatchPatch.patch_deepCopy(patches).reverse();
        patches.cl_each(function(patch) {
          patch.diffs.cl_each(function(diff) {
            diff[0] = -diff[0];
          });
        });
        return patches;
      },
    },
  };

  function State() {}

  function StateMgr() {
    var currentTime, lastTime;

    this.isBufferState = function() {
      currentTime = Date.now();
      return currentTime - lastTime < self.options.bufferStateUntilIdle;
    };
  }

  function addToStack(stack) {
    return function() {
      stack.push(this);
      this.patches = previousPatches;
      previousPatches = [];
    };
  }

  State.prototype.addToUndoStack = addToStack(undoStack);
  State.prototype.addToRedoStack = addToStack(redoStack);

  var stateMgr = new StateMgr();

  this.addDiffs = function(oldContent, newContent, diffs) {
    var patches = self.options.patchHandler.makePatches(oldContent, newContent, diffs);
    currentPatches.push.apply(currentPatches, patches);
  };

  function saveCurrentPatches() {
    // Move currentPatches into previousPatches
    Array.prototype.push.apply(previousPatches, currentPatches);
    currentPatches = [];
  }

  this.saveState = debounce(function() {
    redoStack.length = 0;
    if (!stateMgr.isBufferState()) {
      currentState.addToUndoStack();

      // Limit the size of the stack
      while (undoStack.length > self.options.undoStackMaxSize) {
        undoStack.shift();
      }
    }
    saveCurrentPatches();
    currentState = new State();
    self.$trigger('undoStateChange');
  });

  function restoreState(patches, isForward) {
    // Update editor
    var content = editor.getContent();
    if (!isForward) {
      patches = self.options.patchHandler.reversePatches(patches);
    }

    var newContent = self.options.patchHandler.applyPatches(patches, content);
    var newContentText = newContent.text || newContent;
    var range = editor.setContent(newContentText, true);
    var selection = newContent.selection || {
      start: range.end,
      end: range.end,
    };

    selectionMgr.setSelectionStartEnd(selection.start, selection.end);

    self.$trigger('undoStateChange');
    editor.adjustCursorPosition();
  }

  this.undo = function() {
    var state = undoStack.pop();
    if (!state) {
      return;
    }
    saveCurrentPatches();
    currentState.addToRedoStack();
    restoreState(currentState.patches);
    previousPatches = state.patches;
    currentState = state;
  };

  this.redo = function() {
    var state = redoStack.pop();
    if (!state) {
      return;
    }
    currentState.addToUndoStack();
    restoreState(state.patches, true);
    previousPatches = state.patches;
    currentState = state;
  };

  this.init = function(options) {
    self.options.cl_extend(options || {});
    selectionMgr = editor.selectionMgr;
    if (!currentState) {
      currentState = new State();
    }
  };
}

cledit.UndoMgr = UndoMgr;
