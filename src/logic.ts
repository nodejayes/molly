import { MollyConfiguration } from "./models/configuration/molly_configuration";

/**
 * holds the registred Collection, Validation and Operation Logic
 * 
 * @export
 * @class Logic
 */
export class Logic {
    /**
     * Configuration
     * 
     * @static
     * @memberof Logic
     */
    static Configuration = new MollyConfiguration();
}