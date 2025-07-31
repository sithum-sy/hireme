import apiClient from './ApiClient';
import BaseService from './BaseService';

/**
 * Service Registry - Centralized service management and dependency injection
 * Provides singleton pattern for services and manages their dependencies
 */
class ServiceRegistry {
    constructor() {
        this.services = new Map();
        this.factories = new Map();
        this.apiClient = apiClient;
    }

    /**
     * Register a service factory
     */
    register(name, factory, options = {}) {
        if (typeof factory !== 'function') {
            throw new Error(`Service factory for '${name}' must be a function`);
        }

        this.factories.set(name, {
            factory,
            singleton: options.singleton !== false, // Default to singleton
            dependencies: options.dependencies || [],
        });
    }

    /**
     * Get a service instance
     */
    get(name) {
        // Return cached instance for singletons
        if (this.services.has(name)) {
            return this.services.get(name);
        }

        // Get factory configuration
        const config = this.factories.get(name);
        if (!config) {
            throw new Error(`Service '${name}' not registered`);
        }

        // Resolve dependencies
        const dependencies = config.dependencies.map(dep => this.get(dep));

        // Create service instance
        const instance = config.factory(this.apiClient, ...dependencies);

        // Cache singleton instances
        if (config.singleton) {
            this.services.set(name, instance);
        }

        return instance;
    }

    /**
     * Check if service is registered
     */
    has(name) {
        return this.factories.has(name);
    }

    /**
     * Remove service from registry
     */
    remove(name) {
        this.factories.delete(name);
        this.services.delete(name);
    }

    /**
     * Clear all services
     */
    clear() {
        this.factories.clear();
        this.services.clear();
    }

    /**
     * Register a simple service class
     */
    registerClass(name, ServiceClass, options = {}) {
        this.register(name, (apiClient, ...deps) => {
            return new ServiceClass(apiClient, ...deps);
        }, options);
    }

    /**
     * Register multiple services from an object
     */
    registerServices(services) {
        Object.entries(services).forEach(([name, config]) => {
            if (typeof config === 'function') {
                this.register(name, config);
            } else if (config.factory) {
                this.register(name, config.factory, config.options);
            } else if (config.class) {
                this.registerClass(name, config.class, config.options);
            }
        });
    }

    /**
     * Create a scoped registry for testing
     */
    createScope() {
        const scope = new ServiceRegistry();
        scope.apiClient = this.apiClient;
        
        // Copy factories but not instances
        this.factories.forEach((config, name) => {
            scope.factories.set(name, config);
        });

        return scope;
    }

    /**
     * Get all registered service names
     */
    getRegisteredServices() {
        return Array.from(this.factories.keys());
    }

    /**
     * Get service configuration
     */
    getServiceConfig(name) {
        return this.factories.get(name);
    }
}

// Create and export default registry
const serviceRegistry = new ServiceRegistry();

export default serviceRegistry;
export { ServiceRegistry };