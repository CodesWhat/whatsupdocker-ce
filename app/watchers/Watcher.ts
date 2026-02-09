import Component from '../registry/Component.js';
import { Container, ContainerReport } from '../model/container.js';

/**
 * Watcher abstract class.
 */
abstract class Watcher extends Component {
    /**
     * Watch main method.
     * @returns {Promise<any[]>}
     */
    abstract watch(): Promise<ContainerReport[]>;

    /**
     * Watch a Container.
     * @param container
     * @returns {Promise<any>}
     */
    abstract watchContainer(container: Container): Promise<ContainerReport>;
}

export default Watcher;
