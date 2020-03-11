import Prism from "prismjs";
import cledit from "../libs/cledit";
import htmlSanitizer from '../libs/htmlSanitizer';
import markdownConversionSvc from "./markdownConversionSvc";
import markdownGrammarSvc from "./markdownGrammarSvc";
import Vue from "vue";

function editorSvcFun() {
  return Object.assign(new Vue(), {
    // Elements
    editorElt: null,
    // Other objects
    clEditor: null,
    options: null,
    prismGrammars: null,
    converter: null,
    parsingCtx: null,
    sectionList: null,
    selectionRange: null,

    /**
     * Initialize the Prism grammar with the options
     */
    initPrism() {
      const options = {
        ...this.options,
        ...markdownConversionSvc.defaultOptions
      };
      this.prismGrammars = markdownGrammarSvc.makeGrammars(options);
    },

    /**
     * Initialize the markdown-it converter with the options
     */
    initConverter() {
      this.converter = markdownConversionSvc.createConverter(this.options, true);
    },

    /**
     * Initialize the cledit editor with markdown-it section parser and Prism highlighter
     */
    initClEditor() {
      const options = {
        sectionHighlighter: section => {
          return Prism.highlight(section.text, this.prismGrammars[section.data]);
        },
        sectionParser: text => {
          this.parsingCtx = markdownConversionSvc.parseSections(this.converter, text);
          return this.parsingCtx.sections;
        }
      };
      this.clEditor.init(options);
    },

    /**
     * Pass the elements to the store and initialize the editor.
     */
    init(editorElt) {
      this.editorElt = editorElt;

      this.clEditor = cledit(editorElt);

      this.clEditor.on("contentChanged", sectionList => {
        this.parsingCtx = {
          ...this.parsingCtx,
          sectionList
        };
      });

      /* -----------------------------
       * Inline images
       */
      this.clEditor.highlighter.on("sectionHighlighted", section => {
        section.elt.getElementsByClassName("token img").cl_each(imgTokenElt => {
          const srcElt = imgTokenElt.querySelector(".token.cl-src");
          if (srcElt) {
            // Create an img element before the .img.token and wrap both elements
            // into a .token.img-wrapper
            const imgElt = document.createElement("img");
            imgElt.style.display = "none";
            const uri = srcElt.textContent;
            if (!/^unsafe/.test(htmlSanitizer.sanitizeUri(uri, true))) {
              imgElt.onload = () => {
                imgElt.style.display = "";
              };
              imgElt.src = uri;
              // Take img size into account
              const sizeElt = imgTokenElt.querySelector(".token.cl-size");
              if (sizeElt) {
                const match = sizeElt.textContent.match(/=(\d*)x(\d*)/);
                if (match[1]) {
                  imgElt.width = parseInt(match[1], 10);
                }
                if (match[2]) {
                  imgElt.height = parseInt(match[2], 10);
                }
              }
            }
            const imgTokenWrapper = document.createElement("span");
            imgTokenWrapper.className = "token img-wrapper";
            imgTokenElt.parentNode.insertBefore(imgTokenWrapper, imgTokenElt);
            imgTokenWrapper.appendChild(imgElt);
            imgTokenWrapper.appendChild(imgTokenElt);
          }
        });
      });

      this.options = {};
      this.initPrism();
      this.initConverter();
      this.initClEditor();
      this.clEditor.toggleEditable(true);

      this.$emit("inited");
    }
  });
}

export default editorSvcFun;
