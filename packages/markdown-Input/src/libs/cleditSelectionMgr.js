import cledit from './cleditCore';

function SelectionMgr(editor) {
  var contentElt = editor.$contentElt;
  cledit.Utils.createEventHooks(this);

  var self = this;
  this.selectionStart = 0;
  this.selectionEnd = 0;
  this.cursorCoordinates = {};

  this.findContainer = function(offset) {
    var result = cledit.Utils.findContainer(contentElt, offset);
    if (result.container.nodeValue === '\n') {
      var hdLfElt = result.container.parentNode;
      if (
        hdLfElt.className === 'hd-lf' &&
        hdLfElt.previousSibling &&
        hdLfElt.previousSibling.tagName === 'BR'
      ) {
        result.container = hdLfElt.parentNode;
        result.offsetInContainer = Array.prototype.indexOf.call(
          result.container.childNodes,
          result.offsetInContainer === 0 ? hdLfElt.previousSibling : hdLfElt,
        );
      }
    }
    return result;
  };

  this.createRange = function(start, end) {
    var range = editor.$document.createRange();
    if (start === end) {
      end = start = isNaN(start) ? start : this.findContainer(start < 0 ? 0 : start);
    } else {
      start = isNaN(start) ? start : this.findContainer(start < 0 ? 0 : start);
      end = isNaN(end) ? end : this.findContainer(end < 0 ? 0 : end);
    }
    range.setStart(start.container, start.offsetInContainer);
    range.setEnd(end.container, end.offsetInContainer);
    return range;
  };

  this.hasFocus = function() {
    return contentElt === editor.$document.activeElement;
  };

  this.restoreSelection = function() {
    var min = Math.min(this.selectionStart, this.selectionEnd);
    var max = Math.max(this.selectionStart, this.selectionEnd);
    var selectionRange = this.createRange(min, max);
    if (editor.$document.contains(selectionRange.commonAncestorContainer)) {
      var selection = editor.$window.getSelection();
      selection.removeAllRanges();
      var isBackward = this.selectionStart > this.selectionEnd;
      if (selection.extend) {
        var beginRange = selectionRange.cloneRange();
        beginRange.collapse(!isBackward);
        selection.addRange(beginRange);
        if (isBackward) {
          selection.extend(selectionRange.startContainer, selectionRange.startOffset);
        } else {
          selection.extend(selectionRange.endContainer, selectionRange.endOffset);
        }
      }
      return selectionRange;
    }
  };

  function setSelection(start, end) {
    if (start === undefined) {
      start = self.selectionStart;
    }
    if (start < 0) {
      start = 0;
    }
    if (end === undefined) {
      end = this.selectionEnd;
    }
    if (end < 0) {
      end = 0;
    }
    self.selectionStart = start;
    self.selectionEnd = end;
  }

  this.setSelectionStartEnd = function(start, end) {
    setSelection(start, end);
    return this.hasFocus() && this.restoreSelection();
  };

  this.saveSelectionState = (function() {
    function getClosestAncestorIn(node, ancestor, selfIsAncestor) {
      var p;
      var n = selfIsAncestor ? node : node.parentNode;
      while (n) {
        p = n.parentNode;
        if (p === ancestor) {
          return n;
        }
        n = p;
      }
      return null;
    }

    function getNodeIndex(node) {
      var i = 0;
      while ((node = node.previousSibling)) {
        ++i;
      }
      return i;
    }

    function comparePoints(nodeA, offsetA, nodeB, offsetB) {
      // See http://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html#Level-2-Range-Comparing
      var nodeC;
      if (nodeA === nodeB) {
        // Case 1: nodes are the same
        return offsetA === offsetB ? 0 : offsetA < offsetB ? -1 : 1;
      } else if ((nodeC = getClosestAncestorIn(nodeB, nodeA, true))) {
        // Case 2: node C (container B or an ancestor) is a child node of A
        return offsetA <= getNodeIndex(nodeC) ? -1 : 1;
      } else if ((nodeC = getClosestAncestorIn(nodeA, nodeB, true))) {
        // Case 3: node C (container A or an ancestor) is a child node of B
        return getNodeIndex(nodeC) < offsetB ? -1 : 1;
      }
    }

    function save() {
      var result;
      if (self.hasFocus()) {
        var selectionStart = self.selectionStart;
        var selectionEnd = self.selectionEnd;
        var selection = editor.$window.getSelection();
        if (selection.rangeCount > 0) {
          var selectionRange = selection.getRangeAt(0);
          var node = selectionRange.startContainer;
          if (
            contentElt.compareDocumentPosition(node) & window.Node.DOCUMENT_POSITION_CONTAINED_BY ||
            contentElt === node
          ) {
            var offset = selectionRange.startOffset;
            if (node.firstChild && offset > 0) {
              node = node.childNodes[offset - 1];
              offset = node.textContent.length;
            }
            var container = node;
            while (node !== contentElt) {
              while ((node = node.previousSibling)) {
                offset += (node.textContent || '').length;
              }
              node = container = container.parentNode;
            }
            var selectionText = selectionRange + '';
            // Fix end of line when only br is selected
            var brElt = selectionRange.endContainer.firstChild;
            if (brElt && brElt.tagName === 'BR' && selectionRange.endOffset === 1) {
              selectionText += '\n';
            }

            if (
              comparePoints(
                selection.anchorNode,
                selection.anchorOffset,
                selection.focusNode,
                selection.focusOffset,
              ) === 1
            ) {
              selectionStart = offset + selectionText.length;
              selectionEnd = offset;
            } else {
              selectionStart = offset;
              selectionEnd = offset + selectionText.length;
            }

            if (selectionStart === selectionEnd && selectionStart === editor.getContent().length) {
              // If cursor is after the trailingNode
              selectionStart = --selectionEnd;
              result = self.setSelectionStartEnd(selectionStart, selectionEnd);
            } else {
              setSelection(selectionStart, selectionEnd);
            }
          }
        }
      }
      return result;
    }

    return function() {
      save();
    };
  })();
}

cledit.SelectionMgr = SelectionMgr;
