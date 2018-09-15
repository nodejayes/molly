import {collection, validation} from '../../src/decorators';
import {BaseTypes}              from '../../src/basic';

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
export class Right {
  @validation({type: BaseTypes.mongoDbObjectId})
  _id: string;

  @validation({type: BaseTypes.stringDefaultLength})
  key: string;

  @validation({type: BaseTypes.bool})
  active: boolean;
}
