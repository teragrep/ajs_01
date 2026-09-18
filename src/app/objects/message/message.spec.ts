import {Message} from './message';
import {WebSocketPayloadImpl} from '../safeJson/webSocketPayloadImpl';
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
      message = new MessageImpl(new WebSocketPayloadImpl(json));
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

    it('Should have data as WebSocketPayload', () => {
      const expected = new WebSocketPayloadImpl(json.data);
      expect(message.dataAsWebSocketPayload()).toEqual(expected);
    });
  });
});
