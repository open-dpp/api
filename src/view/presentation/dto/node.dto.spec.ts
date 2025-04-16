import { nodeFromDto } from './node.dto';
import { ValueError } from '../../../exceptions/domain.errors';

describe('nodeFromDto', () => {
  it('should fail if node could not be created', () => {
    const createDto = {
      type: 'Unknown Type',
    };
    // @ts-expect-error Error should occur if not supported type is provided
    expect(() => nodeFromDto(createDto)).toThrow(
      new ValueError(`Type Unknown Type not supported`),
    );
  });
});
