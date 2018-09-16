import {ISwaggerMollyResponse, ISwaggerParameter} from '..';

/**
 *
 */
export interface ISwaggerMollyPost {
  tags: string[];
  summary: string;
  description: string;
  operationId: string;
  consumes: string[];
  produces: string[];
  parameters: ISwaggerParameter[];
  responses: ISwaggerMollyResponse;
}
