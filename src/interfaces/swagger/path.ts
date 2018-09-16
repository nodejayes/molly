import {ISwaggerParameter, ISwaggerResponse} from '..';

/**
 *
 */
export interface ISwaggerPath {
  tags: string[];
  summary: string;
  description: string;
  operationId: string;
  consumes: string[];
  produces: string[];
  parameters: ISwaggerParameter[];
  responses: ISwaggerResponse;
}
