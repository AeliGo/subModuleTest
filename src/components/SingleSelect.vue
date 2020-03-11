<template>
  <div class="autocomplete control single-select" :class="{ 'is-expanded': expanded }">
    <b-input
      v-model="newValue"
      ref="input"
      type="text"
      icon="chevron-down"
      :size="size"
      :loading="loading"
      :rounded="rounded"
      :icon-pack="iconPack"
      :maxlength="maxlength"
      :autocomplete="newAutocomplete"
      :use-html5-validation="useHtml5Validation"
      :placeholder="hovered ? hovered[field] : placeholder"
      v-bind="$attrs"
      @input="onInput"
      @focus="focused"
      @blur="onBlur"
      @keyup.native.esc.prevent="isActive = false"
      @keydown.native.tab="tabPressed"
      @keydown.native.enter.prevent="enterPressed"
      @keydown.native.up.prevent="keyArrows('up')"
      @keydown.native.down.prevent="keyArrows('down')"
    />
    <transition name="fade">
      <div
        class="dropdown-menu"
        :class="{ 'is-opened-top': !isListInViewportVertically }"
        v-show="isActive && (flatFilteredOptions.length > 0 || hasEmptySlot || hasHeaderSlot)"
        ref="dropdown"
      >
        <div class="dropdown-content" v-show="isActive">
          <div v-if="hasHeaderSlot" class="dropdown-item">
            <slot name="header" />
          </div>
          <template v-for="(group, groupName) in filteredOptions" v-key="groupName">
            <p v-if="groupBy" class="dropdown-item-group">{{ groupName }}</p>
            <a
              v-for="(option, index) in group"
              :key="groupName + index"
              class="dropdown-item level is-marginless"
              :class="option === selected ? 'is-active' : option === hovered ? 'is-hovered' : ''"
              @click="setSelected(option)"
            >
              <slot v-if="hasDefaultSlot" :option="option" :index="index" />
              <text-highlight v-else :queries="newValue || ''">{{ getValue(option, true) }}</text-highlight>
              <b-icon
                :icon="option === selected ? 'check' : option === hovered ? 'keyboard-return' : ''"
                custom-size="mdi-18px"
              />
            </a>
          </template>
          <div v-if="data.length === 0 && hasEmptySlot" class="dropdown-item is-disabled">
            <slot name="empty" />
          </div>
          <div v-if="hasFooterSlot" class="dropdown-item">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { getValueByPath } from "buefy/src/utils/helpers";
import FormElementMixin from "buefy/src/utils/FormElementMixin";
import Input from "buefy/src/components/input/Input";
export default {
  name: "SingleSelect",
  components: {
    [Input.name]: Input
  },
  mixins: [FormElementMixin],
  inheritAttrs: false,
  $_veeValidate: {
    value() {
      return this.value;
    },
    // name getter
    name() {
      return "value";
    }
  },
  props: {
    value: [Number, String],
    data: {
      type: Array,
      default: () => []
    },
    field: {
      type: String
    },
    filtered: Boolean,
    groupBy: String,
    sortBy: String,
    keepFirst: Boolean,
    placeholder: {
      type: String,
      default: ""
    },
    clearOnSelect: Boolean,
    openOnFocus: Boolean,
    customFormatter: Function,
    trackBy: {
      type: String,
      default() {
        // Check whether `data` is an object array or simple array
        // Do not use track-by if it's simple array
        let isArrayOptions = Array.isArray(this.data);
        let isObjectOption = isArrayOptions ? typeof this.data[0] === "object" : false;
        if (isObjectOption) {
          return "id";
        }
        return null;
      }
    }
  },
  data() {
    return {
      selected: null,
      hovered: null,
      isActive: false,
      newValue: null,
      readOnlySearchValue: "",
      newAutocomplete: this.autocomplete || "off",
      isListInViewportVertically: true,
      hasFocus: false,
      _isAutocomplete: true,
      _elementRef: "input"
    };
  },
  computed: {
    /**
     * Normalise options into grouped mulitple array by groupBy
     */
    filteredOptions() {
      let search = this.newValue || "";
      const normalizedSearch = search.toLowerCase().trim();
      let optionCollection = collect(this.data);
      return optionCollection
        .when(this.filtered && !this.selected, items =>
          items.filter((item, key) => {
            if (item === undefined) str = "undefined";
            if (item === null) str = "null";
            if (item === false) str = "false";
            const optionLabel = this.field ? item[this.field] : item;
            if (!optionLabel) return false;
            return optionLabel.toLowerCase().indexOf(normalizedSearch.toLowerCase()) !== -1;
          })
        )
        .when(this.groupBy, items =>
          items.sortBy(this.sortBy || this.field).mapToGroups((item, key) => [item[this.groupBy], item])
        )
        .when(!this.groupBy, items => {
          return this.sortBy || this.field
            ? items
                .sortBy(this.sortBy || this.field)
                .groupBy(null)
                .map(items => items.all())
            : items
                .sort()
                .groupBy(null)
                .map(items => items.all());
        })
        .all();
    },
    /**
     * Flat `filteredOptions` array for arrow up/down
     */
    flatFilteredOptions() {
      return collect(this.filteredOptions)
        .flatten(1)
        .all();
    },
    /**
     * White-listed items to not close when clicked.
     * Add input, dropdown and all children.
     */
    whiteList() {
      const whiteList = [];
      if (!this.$refs.input) return whiteList;
      whiteList.push(this.$refs.input.$el.querySelector("input"));
      whiteList.push(this.$refs.dropdown);
      // Add all chidren from dropdown
      if (this.$refs.dropdown !== undefined) {
        const children = this.$refs.dropdown.querySelectorAll("*");
        for (const child of children) {
          whiteList.push(child);
        }
      }
      if (this.$parent.$data._isTaginput) {
        // Add taginput container
        whiteList.push(this.$parent.$el);
        // Add .tag and .delete
        const tagInputChildren = this.$parent.$el.querySelectorAll("*");
        for (const tagInputChild of tagInputChildren) {
          whiteList.push(tagInputChild);
        }
      }
      return whiteList;
    },
    /**
     * Check if exists default slot
     */
    hasDefaultSlot() {
      return !!this.$scopedSlots.default;
    },
    /**
     * Check if exists "empty" slot
     */
    hasEmptySlot() {
      return !!this.$slots.empty;
    },
    /**
     * Check if exists "header" slot
     */
    hasHeaderSlot() {
      return !!this.$slots.header;
    },
    /**
     * Check if exists "footer" slot
     */
    hasFooterSlot() {
      return !!this.$slots.footer;
    },
    /**
     * Check if this component is read only
     */
    isReadOnly() {
      return !!this.$attrs.readonly;
    },
    /**
     * Get  a sorted `data` collection
     */
    sortedDataCollection() {
      let optionCollection = collect(this.data);
      return this.field ? optionCollection.sortBy(this.field) : optionCollection.sort();
    }
  },
  watch: {
    /**
     * When dropdown is toggled, check the visibility to know when
     * to open upwards.
     */
    isActive(active) {
      if (active) {
        this.calcDropdownInViewportVertical();
        this.selected && this.setHovered(this.selected);
      } else {
        this.$nextTick(() => this.setHovered(null));
        // Timeout to wait for the animation to finish before recalculating
        setTimeout(() => {
          this.calcDropdownInViewportVertical();
        }, 100);
      }
    },
    /**
     * When v-model is changed:
     *   1. Update internal value.
     *   2. If it's invalid, validate again.
     */
    value(value) {
      // Clear current newValue
      if (!value && this.newValue) {
        this.newValue = null;
      }
      if (value && !this.newValue) {
        this.setValue(this.value);
      }
    },
    /**
     * When v-model is changed:
     *   1. Update internal value.
     *   2. If it's invalid, validate again.
     */
    // value(value) {
    //   this.newValue = value;
    //   !this.isValid && this.$refs.input.checkHtml5Validity();
    // },
    /**
     * Select first option if "keep-first
     */
    data(value) {
      // Keep first option always pre-selected
      if (this.keepFirst && !this.selected) {
        this.selectFirstOption(this.flatFilteredOptions);
      }
    }
  },
  created() {
    if (typeof window !== "undefined") {
      document.addEventListener("click", this.clickedOutside, true);
      window.addEventListener("resize", this.calcDropdownInViewportVertical);
      if (this.isReadOnly) {
        window.addEventListener("keypress", this.readOnlySearch, true);
      }
    }
  },
  mounted() {
    this.setValue(this.value);
  },
  beforeDestroy() {
    if (typeof window !== "undefined") {
      document.removeEventListener("click", this.clickedOutside);
      window.removeEventListener("resize", this.calcDropdownInViewportVertical);
      if (this.isReadOnly) {
        window.removeEventListener("keypress", this.readOnlySearch);
      }
    }
  },
  methods: {
    /**
     * Handle key pressed event on read only search
     *
     * Log user entered keycode and set hover to the item matches with search keycodes
     */
    readOnlySearch(event) {
      let typed = String.fromCharCode(event.keyCode);
      let validKey = /^[a-zA-Z ]+$/.test(typed);
      if (validKey) {
        this.readOnlySearchValue += typed;
        let index = this.sortedDataCollection.search((item, key) => {
          const optionLabel = this.field ? item[this.field] : item;
          if (!optionLabel) return false;
          return optionLabel.toLowerCase().indexOf(this.readOnlySearchValue.toLowerCase()) !== -1;
        });
        if (index !== false) {
          this.setHovered(this.data[index]);
        } else {
          this.readOnlySearchValue = "";
        }
      }
    },
    /**
     * Set which option is currently hovered.
     */
    setHovered(option) {
      if (option === undefined) return;
      this.hovered = option;
    },
    /**
     * Set which option is currently selected, update v-model,
     * update input value and close dropdown.
     */
    setSelected(option, closeDropdown = true) {
      if (option === undefined) return;
      this.selected = option;
      this.selected ? this.$emit("select", this.selected) : this.$emit("deselect", this.selected);
      if (this.selected !== null) {
        this.newValue = this.clearOnSelect ? "" : this.getValue(this.selected);
        this.$emit("input", this.trackBy ? this.selected[this.trackBy] : this.selected);
      } else {
        this.$emit("input", null);
      }
      closeDropdown &&
        this.$nextTick(() => {
          this.isActive = false;
        });
    },
    /**
     * Set current `selected` and `newValue`
     * This is to set display input and track-by value from `data` list
     *
     * Returns boolean, if set value successful; false means value trying to set is not in the list
     */
    setValue(value) {
      if (this.trackBy) {
        this.selected = this.data.find(option => option[this.trackBy] === value);
      } else {
        this.selected = this.data.find(option => option === value);
      }
      if (this.selected) {
        this.setHovered(this.selected);
        this.newValue = this.field ? this.selected[this.field] : this.selected;
        return true;
      }
      return false;
    },
    /**
     * Select first option
     */
    selectFirstOption(options) {
      this.$nextTick(() => {
        if (options.length) {
          // If has visible data or open on focus, keep updating the hovered
          if (this.openOnFocus || (this.newValue !== "" && this.hovered !== options[0])) {
            this.setHovered(options[0]);
          }
        } else {
          this.setHovered(null);
        }
      });
    },
    /**
     * Enter key listener.
     * Select the hovered option.
     */
    enterPressed() {
      if (this.hovered === null) return;
      this.setSelected(this.hovered);
    },
    /**
     * Tab key listener.
     * Select hovered option if it exists, close dropdown, then allow
     * native handling to move to next tabbable element.
     */
    tabPressed() {
      if (this.hovered === null) {
        this.isActive = false;
        return;
      }
      this.setSelected(this.hovered);
    },
    /**
     * Close dropdown if clicked outside.
     */
    clickedOutside(event) {
      if (this.whiteList.indexOf(event.target) < 0) {
        this.isActive = false;
        // Empty input if no selected option
        if (!this.selected && this.newValue) {
          this.newValue = "";
        }
      }
    },
    /**
     * Return display text for the input.
     * If object, get value from path, or else just the value.
     */
    getValue(option, isOption = false) {
      if (!option) return;
      if (typeof this.customFormatter !== "undefined" && !isOption) {
        return this.customFormatter(option);
      }
      return typeof option === "object" ? getValueByPath(option, this.field) : option;
    },
    /**
     * Calculate if the dropdown is vertically visible when activated,
     * otherwise it is openened upwards.
     */
    calcDropdownInViewportVertical() {
      this.$nextTick(() => {
        /**
         * this.$refs.dropdown may be undefined
         * when Autocomplete is conditional rendered
         */
        if (this.$refs.dropdown === undefined) return;
        const rect = this.$refs.dropdown.getBoundingClientRect();
        this.isListInViewportVertically =
          rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
      });
    },
    /**
     * Arrows keys listener.
     * If dropdown is active, set hovered option, or else just open.
     */
    keyArrows(direction) {
      const sum = direction === "down" ? 1 : -1;
      if (this.isActive) {
        let index = this.hovered ? this.flatFilteredOptions.findIndex(item => item.id == this.hovered.id) + sum : 0;
        index = index > this.flatFilteredOptions.length - 1 ? this.flatFilteredOptions.length : index;
        index = index < 0 ? 0 : index;
        this.setHovered(this.flatFilteredOptions[index]);
        const list = this.$refs.dropdown.querySelector(".dropdown-content");
        const element = list.querySelectorAll("a.dropdown-item:not(.is-disabled)")[index];
        if (!element) return;
        const visMin = list.scrollTop;
        const visMax = list.scrollTop + list.clientHeight - element.clientHeight;
        if (element.offsetTop < visMin) {
          list.scrollTop = element.offsetTop;
        } else if (element.offsetTop >= visMax) {
          list.scrollTop = element.offsetTop - list.clientHeight + element.clientHeight;
        }
      } else {
        this.isActive = true;
      }
    },
    /**
     * Focus listener.
     * If value is the same as selected, select all text.
     */
    focused(event) {
      if (this.getValue(this.selected) === this.newValue) {
        this.$el.querySelector("input").select();
      }
      if (this.openOnFocus) {
        this.isActive = true;
        if (this.keepFirst && !this.selected) {
          this.selectFirstOption(this.flatFilteredOptions);
        }
        if (this.selected) {
          this.setHovered(this.selected);
        }
      }
      this.hasFocus = true;
      this.$emit("focus", event);
    },
    /**
     * Blur listener.
     */
    onBlur(event) {
      this.hasFocus = false;
      this.$emit("blur", event);
    },
    /**
     * When updating input's value
     *   1. Emit changes
     *   2. If value isn't the same as selected, set null
     *   3. Close dropdown if value is clear or else open it
     */
    onInput(event) {
      const currentValue = this.getValue(this.selected);
      if (currentValue && currentValue === this.newValue) return;
      this.$emit("search-change", this.newValue);
      if (currentValue && currentValue !== this.newValue) {
        this.selected = null;
      }
      this.keepFirst && this.selectFirstOption(this.flatFilteredOptions);
      // Close dropdown if input is clear or else open it
      if (this.hasFocus && (!this.openOnFocus || this.newValue)) {
        this.isActive = !!this.newValue;
      }
    }
  }
};
</script>

<style lang="scss">
@import "../assets/_variables";
.single-select {
  input:focus {
    &:read-only {
      border-color: $input-focus-border-color;
      box-shadow: $input-focus-box-shadow-size $input-focus-box-shadow-color;
      &::selection {
        background: transparent;
      }
    }
  }
  &.control {
    input {
      padding-right: 2.6155rem;
      padding-left: $control-padding-horizontal !important;
    }
    .is-loading {
      span.icon {
        display: none;
      }
      &::after {
        right: 1rem;
        top: calc(#{$control-height} / 2 - 0.5em);
      }
    }
    :not(.is-loading) {
      span.icon {
        right: 0;
        left: initial !important;
      }
    }
  }
  .dropdown-menu {
    .dropdown-content {
      padding: 0rem;
      .dropdown-item-group {
        background: $white-bis;
        color: $text-strong;
        font-weight: $strong-weight;
        padding: 0.75rem 1rem;
      }
      .dropdown-item {
        padding: 0.75rem 1rem 0.75rem 1rem;
        mark {
          border-radius: 0;
          color: inherit;
          background-color: transparent;
        }
        &:not(.is-active) {
          mark {
            background-color: $blue-light;
            outline: 1px solid $blue-light;
          }
        }
        &.is-active {
          color: $white;
          background-color: $primary;
        }
      }
    }
  }
}
</style>
