import {BaseTypes, collection, ExpressServer, JoinType, MongoLookup, validation} from '../../src';
import 'mocha';

describe('recursive lookups', () => {
  let server = new ExpressServer();

  before(() => {
    server.clearConfiguration();
  });

  after(() => {
    server.stop();
  });

  it('can declare recursive lookup', async () => {
    @collection({allow: 'CUD', lookup: [
      new MongoLookup('User', 'users', '_id', JoinType.ONEMANY)
    ]})
    class Group {
      @validation({type: BaseTypes.mongoDbObjectId})
      _id: string;
      @validation({type: BaseTypes.stringDefaultLength})
      name: string;
      users: User[];
    }

    @collection({allow: 'CUD', lookup: [
      new MongoLookup('Group', 'group', '_id', JoinType.ONEONE)
    ]})
    class User {
      @validation({type: BaseTypes.mongoDbObjectId})
      _id: string;
      @validation({type: BaseTypes.stringDefaultLength})
      name: string;
      @validation({type: BaseTypes.integer.positive().max(120)})
      age: number;
      group: Group;
    }

    await server.start({
      binding: 'localhost',
      port: 8086,
      mongoUrl: 'mongodb://localhost:27017/',
      mongoDatabase: 'test_molly',
      clear: true
    });
  });
});
