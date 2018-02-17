import {MongoClient} from 'mongodb';
import {MongoLookup} from './lookup';

export class CollectionInformation {
    Name: string;
    Joins: Array<MongoLookup>;
    setIndex: Function;

    constructor(name: string, joins?: Array<MongoLookup>, setIndex?: Function) {
        if (name.length < 1) {
            throw new Error(`no empty names allowed`);
        }
        this.Name = name;
        if (joins) {
            this.Joins = joins;
        }
        if (setIndex) {
            this.setIndex = setIndex;
        }
    }
}