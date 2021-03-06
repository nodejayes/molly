import {Schema}   from 'joi';
import {JoinType} from '../..';

/**
 * Validation Informations
 *
 * @export
 * @interface IValidationProperties
 */
export interface IValidationProperties {
  type?: Schema;
  existType?: string;
  join?: JoinType;
  name?: string;
  classname?: string;
  prototypes?: string[];
}
