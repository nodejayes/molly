/**
 * Swagger Parameter Structure
 *
 * @export
 * @interface ISwaggerParameter
 */
export interface ISwaggerParameter {
  in: string;
  name: string;
  description: string;
  required: boolean;
  schema: any
}
