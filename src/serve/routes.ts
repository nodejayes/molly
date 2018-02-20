import {Collection, ObjectId} from 'mongodb';
import {hasIn, unset, keys} from 'lodash';
import {IRequestModel} from './../models/communicate/request';
import {ResponseModel} from './../models/communicate/response';

import {Logic} from './../logic';
import { ValidationInformation } from '../models/configuration/validation_information';
import {MongoDb} from './../database/mongo_db';
import { CollectionStore } from '../models/configuration/collection_store';
import {MongoLookup} from './../models/configuration/lookup';

/**
 * holds all available Routes
 * 
 * @export
 * @class Routes
 */
export class Routes {
    static get Names(): Array<string> {
        return [
            'create', 'read', 'update', 'delete'
        ];
    }
    private static _getValidation(action: string, model: string): ValidationInformation {
        let validations = Logic.Configuration.validationInfos.filter((e: ValidationInformation) => {
            return e.Name === model;
        });
        if (validations.length < 1) {
            return null;
        }
        return validations[0];
    }
    private static _getCollection(model: string): CollectionStore {
        let collections = MongoDb.Collections.filter((e: CollectionStore) => {
            return e.collection.collectionName === model;
        });
        if (collections.length < 1) {
            return null;
        }
        return collections[0];
    }
    private static _getPipeline(joins: Array<MongoLookup>, data: IRequestModel): Array<Object> {
        let restrictions = null;
        let hasRestrictions = hasIn(data.Parameter, 'RESTRICTIONS');
        if (hasRestrictions) {
            restrictions = data.Parameter['RESTRICTIONS'];
            unset(data.Parameter, 'RESTRICTIONS');
        }
        let pipe = new Array<Object>();
        if (joins) {
            for (let i = 0; i < joins.length; i++) {
                let j = joins[i];
                pipe = pipe.concat(j.getAggregate());
            }
        }
        if (keys(data.Parameter).length > 0) {
            pipe.push({
                '$match': data.Parameter
            });
        }
        if (hasRestrictions) {
            if (hasIn(restrictions, 'sort')) {
                pipe.push({
                    '$sort': restrictions.sort
                });
            }
            if (hasIn(restrictions, 'skip')) {
                pipe.push({
                    '$skip': parseInt(restrictions.skip)
                });
            }
            if (hasIn(restrictions, 'limit')) {
                pipe.push({
                    '$limit': parseInt(restrictions.limit)
                });
            }
        }
        if (data.Properties) {
            pipe.push({
                '$project': data.Properties
            });
        }
        console.info(pipe);
        return pipe;
    }
    /**
     * read a Model from Database
     * 
     * @static
     * @param {IRequestModel} data 
     * @returns {ResponseModel} 
     * @memberof Routes
     */
    static async read(data: IRequestModel): Promise<ResponseModel> {
        let validation = Routes._getValidation(data.Action, data.Model);
        if (validation === null) {
            throw new Error(`no validation found for model ${data.Model}`);
        }     
        let col = Routes._getCollection(data.Model);
        if (col === null) {
            throw new Error(`no collection found for model ${data.Model}`);
        }
        let pipe = Routes._getPipeline(col.joins, data);
        let tmp = validation.checkRead((await col.collection.aggregate(pipe).toArray()));
        return new ResponseModel(tmp, false);
    }

    /**
     * create Model(s) in Database
     * 
     * @static
     * @param {IRequestModel} data 
     * @returns {ResponseModel} 
     * @memberof Routes
     */
    static async create(data: IRequestModel): Promise<ResponseModel> {
        let validation = Routes._getValidation(data.Action, data.Model);
        if (validation === null) {
            throw new Error(`no validation found for model ${data.Model}`);
        }     
        let col = Routes._getCollection(data.Model);
        if (col === null) {
            throw new Error(`no collection found for model ${data.Model}`);
        }
        let input = validation.checkCreate(data.Parameter);
        let tmp = await col.collection.insertMany(input);
        return new ResponseModel(tmp.ops, false);
    }

    /**
     * update a Model in Database
     * 
     * @static
     * @param {IRequestModel} data 
     * @returns {ResponseModel} 
     * @memberof Routes
     */
    static async update(data: IRequestModel): Promise<ResponseModel> {
        let validation = Routes._getValidation(data.Action, data.Model);
        if (validation === null) {
            throw new Error(`no validation found for model ${data.Model}`);
        }     
        let col = Routes._getCollection(data.Model);
        if (col === null) {
            throw new Error(`no collection found for model ${data.Model}`);
        }
        let input = validation.checkUpdate(data.Parameter);
        await col.collection.update({
            _id: new ObjectId(input.id)
        }, {
            '$set': input.updateSet
        });
        return new ResponseModel(true, false);
    }

    /**
     * delete Model(s) from Database
     * 
     * @static
     * @param {IRequestModel} data 
     * @returns {ResponseModel} 
     * @memberof Routes
     */
    static async delete(data: IRequestModel): Promise<ResponseModel> {
        let validation = Routes._getValidation(data.Action, data.Model);
        if (validation === null) {
            throw new Error(`no validation found for model ${data.Model}`);
        }     
        let col = Routes._getCollection(data.Model);
        if (col === null) {
            throw new Error(`no collection found for model ${data.Model}`);
        }
        let input = validation.checkDelete(data.Parameter);
        await col.collection.deleteOne({
            _id: new ObjectId(input.id)
        });
        return new ResponseModel(true, false);
    }

    /**
     * execute a defined Operation
     * 
     * @static
     * @param {IRequestModel} data 
     * @returns {ResponseModel} 
     * @memberof Routes
     */
    static operation(data: IRequestModel): ResponseModel {
        return new ResponseModel(true, false);
    }
}