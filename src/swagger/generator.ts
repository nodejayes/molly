import {Logic} from './../logic';

interface ISwaggerDocument {
    version: string;
    host: string;
    basePath: string;
    schemes: string[];
    info: ISwaggerInfo[];
    tags: ISwaggerTag[];
    paths: ISwaggerPath[];
    definitions: ISwaggerDefinition[];
}

interface ISwaggerInfo {

}

interface ISwaggerPath {

}

interface ISwaggerTag {

}

interface ISwaggerDefinition {
    
}

class DocumentationGenerator {
    constructor() {}

    private _readConfiguration() {
        let collections = Logic.Configuration.collectionInfos;
        let operations = Logic.Configuration.operationInfos;

        for (let i = 0; i < collections.length; i++) {

        }

        for (let i = 0; i < operations.length; i++) {

        }
    }
}