import type { Strategy } from 'passport';
import Component from '../../registry/Component.js';

class Authentication extends Component {
  /**
   * Init the Trigger.
   */
  async init(): Promise<void> {
    return this.initAuthentication();
  }

  /**
   * Init Trigger. Can be overridden in trigger implementation class.
   */
  initAuthentication(): void | Promise<void> {
    // do nothing by default
  }

  /**
   * Return passport strategy.
   */
  getStrategy(): Strategy {
    throw new Error('getStrategy must be implemented');
  }

  getStrategyDescription() {
    throw new Error('getStrategyDescription must be implemented');
  }
}

export default Authentication;
