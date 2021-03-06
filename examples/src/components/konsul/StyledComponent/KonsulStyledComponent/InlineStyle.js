// @flow
import hashStr from 'glamor/lib/hash';
/* eslint-disable import/no-unresolved */

import type { RuleSet } from 'styled-components/lib/types';
import flatten from 'styled-components/lib/utils/flatten';
import parse from 'styled-components/lib/vendor/postcss-safe-parser/parse';

const generated = {};

/*
 InlineStyle takes arbitrary CSS and generates a flat object
 */
export default class InlineStyle {
  rules: RuleSet;

  constructor(rules: RuleSet) {
    this.rules = rules
  }

  generateStyleObject(executionContext: Object) {
    const flatCSS = flatten(this.rules, executionContext).join('');
    const hash = hashStr(flatCSS);
    if (!generated[hash]) {
      const root = parse(flatCSS);
      const declPairs = [];
      root.each(node => {
        if (node.type === 'decl') {
          declPairs.push([node.prop, node.value]);
        } else {
          /* eslint-disable no-console */
          console.warn(`Node of type ${node.type} not supported as an inline style`);
        }
      });
      // RN currently does not support differing values for the corner radii of Image
      // components (but does for View). It is almost impossible to tell whether we'll have
      // support, so we'll just disable multiple values here.
      // https://github.com/styled-components/css-to-react-native/issues/11
      const styles = {
        generated: declPairs,
      };

      generated[hash] = styles.generated
    }
    return generated[hash]
  }
}