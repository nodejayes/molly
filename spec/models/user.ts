import {collection, validation} from '../../src/decorators';
import {JoinType, MongoLookup}  from '../../src/models';
import {BaseTypes}              from '../../src/basic';
import {Group}                  from './group';
import {Bank1, Bank2}           from './bank';
import {BaseModel} from "../../src";

@collection({
  lookup: [
    new MongoLookup('Group', 'group', '_id', JoinType.ONEONE),
    new MongoLookup('Right', 'group.rights', '_id', JoinType.ONEMANY)
  ],
  index: async (col) => {
    await col.createIndex({
      username: 1,
    }, {
      sparse: true,
      unique: true,
      background: true,
    });
  },
  allow: 'CUD'
})
export class User extends BaseModel {
  @validation({type: BaseTypes.stringDefaultLength})
  username: string;

  @validation({type: BaseTypes.stringDefaultLength})
  password: string;

  @validation({type: BaseTypes.stringDefaultLength})
  email: string;

  group: Group;
}

@collection({
  allow: 'CUD', lookup: [
    new MongoLookup('Bank1', 'bank', '_id', JoinType.ONEONE)
  ]
})
export class User1 extends BaseModel {
  @validation({type: BaseTypes.mongoDbObjectId})
  _id: string;
  @validation({type: BaseTypes.stringDefaultLength})
  name: string;
  @validation({type: BaseTypes.integer.positive().max(120)})
  age: number;
  bank: Bank1;
}

@collection({
  allow: 'CUD', lookup: [
    new MongoLookup('Bank2', 'bank', '_id', JoinType.ONEONE)
  ]
})
export class User2 extends BaseModel {
  @validation({type: BaseTypes.mongoDbObjectId})
  _id: string;
  @validation({type: BaseTypes.stringDefaultLength})
  name: string;
  @validation({type: BaseTypes.integer.positive().max(120)})
  age: number;
  bank: Bank2;
}
