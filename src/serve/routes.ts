import {Collection} from 'mongodb';
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
    private static getValidation(action: string, model: string): ValidationInformation {
        let validations = Logic.Configuration.validationInfos.filter((e: ValidationInformation) => {
            return e.Name === model;
        });
        if (validations.length < 1) {
            return null;
        }
        return validations[0];
    }
    private static getCollection(model: string): CollectionStore {
        let collections = MongoDb.Collections.filter((e: CollectionStore) => {
            e.collection.collectionName === model;
        });
        if (collections.length < 1) {
            return null;
        }
        return collections[0];
    }
    private static getPipeline(joins: Array<MongoLookup>, data: IRequestModel): Array<Object> {
        let restrictions = null;
        let hasRestrictions = hasIn(data.Parameter, 'RESTRICTIONS');
        if (hasRestrictions) {
            restrictions = data.Parameter['RESTRICTIONS'];
            unset(data.Parameter, 'RESTRICTIONS');
        }
        let pipe = new Array<Object>();
        for (let i = 0; i < joins.length; i++) {
            let j = joins[i];
            pipe.concat(j.getAggregate());
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
        let validation = Routes.getValidation(data.Action, data.Model);
        if (validation === null) {
            throw new Error(`no validation found for model ${data.Model}`);
        }     
        let col = Routes.getCollection(data.Model);
        if (col === null) {
            throw new Error(`no collection found for model ${data.Model}`);
        }
        let pipe = Routes.getPipeline(col.joins, data);
        let tmp = validation.checkRead((await col.collection.aggregate(pipe)));
        return new ResponseModel(JSON.stringify(tmp), false);
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
        let validation = Routes.getValidation(data.Action, data.Model);
        if (validation === null) {
            throw new Error(`no validation found for model ${data.Model}`);
        }     
        let col = Routes.getCollection(data.Model);
        if (col === null) {
            throw new Error(`no collection found for model ${data.Model}`);
        }
        let input = validation.checkCreate(data.Parameter);
        let tmp = await col.collection.insertMany(input);
        return new ResponseModel(JSON.stringify(tmp.ops), false);
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
        let validation = Routes.getValidation(data.Action, data.Model);
        if (validation === null) {
            throw new Error(`no validation found for model ${data.Model}`);
        }     
        let col = Routes.getCollection(data.Model);
        if (col === null) {
            throw new Error(`no collection found for model ${data.Model}`);
        }
        let input = validation.checkUpdate(data.Parameter);
        await col.collection.update({
            _id: input.id
        }, input.updateSet);
        return new ResponseModel('true', false);
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
        let validation = Routes.getValidation(data.Action, data.Model);
        if (validation === null) {
            throw new Error(`no validation found for model ${data.Model}`);
        }     
        let col = Routes.getCollection(data.Model);
        if (col === null) {
            throw new Error(`no collection found for model ${data.Model}`);
        }
        let input = validation.checkDelete(data.Parameter);
        await col.collection.deleteOne({
            _id: input.id
        });
        return new ResponseModel('true', false);
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
        return new ResponseModel('', false);
    }
}