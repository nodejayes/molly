import {collection, validation} from '../../src/decorators';
import {BaseTypes}              from '../../src/basic';
import {BaseModel} from "../../src";

@collection({
  lookup: null,
  index: async (col) => {
    await col.createIndex({
      key: 1,
    }, {
      sparse: true,
      unique: true,
      background: true,
    });
  },
  allow: 'C'
})
export class Right extends BaseModel {
  @validation({type: BaseTypes.stringDefaultLength})
  key: string;

  @validation({type: BaseTypes.bool})
  active: boolean;
}
