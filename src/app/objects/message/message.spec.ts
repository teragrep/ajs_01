import {Message} from './message';
import {SafeJsonImpl} from '../safeJson/safeJsonImpl';
import {MessageImpl} from './messageImpl';

describe('Message', () => {
  const json = {
    op:'operation',
    data:{
      test:'test'
    }
  };
  let message:Message;

  describe('Birth', () => {
    beforeEach(() => {
      message = new MessageImpl(new SafeJsonImpl(json));
    });

    it('Should have been initialized', () => {
      expect(message).toBeInstanceOf(MessageImpl);
    });

    it('Should have operation', () => {
      expect(message.operation()).toEqual(json.op);
    });

    it('Should have data', () => {
      expect(message.data()).toEqual(json.data);
    });
  });
});
