import {Schema} from 'joi';
import {JoinType} from './../index';

export interface IValidationProperties {
    type?: Schema;
    existType?: string;
    join?: JoinType;
    name?: string;
}