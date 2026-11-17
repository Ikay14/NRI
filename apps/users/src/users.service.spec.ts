import { UsersService } from './users.service';
import { UserRepository } from './user.repository';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Partial<UserRepository>>;

  beforeEach(() => {
    userRepository = {
      findPublicProfile: jest.fn().mockResolvedValue({
        userId: 'user-1',
        firstName: 'Ada',
        lastName: 'Lovelace',
        fullName: 'Ada Lovelace',
        avatar: '',
        bio: '',
        location: '',
      }),
    };
    service = new UsersService(userRepository as unknown as UserRepository);
  });

  it('delegates getPublicProfile to userRepository.findPublicProfile without recursion', async () => {
    const result = await service.getPublicProfile('user-1');
    expect(userRepository.findPublicProfile).toHaveBeenCalledWith('user-1');
    expect(result?.userId).toBe('user-1');
  });
});
