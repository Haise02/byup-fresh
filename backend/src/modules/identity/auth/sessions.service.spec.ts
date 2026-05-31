import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SessionsService } from './sessions.service';
import { Session } from '../entities/session.entity';

describe('SessionsService', () => {
  let service: SessionsService;
  let saveMock: jest.Mock;
  let updateMock: jest.Mock;
  let findOneMock: jest.Mock;

  beforeEach(async () => {
    saveMock = jest.fn().mockImplementation((s) => Promise.resolve(s));
    updateMock = jest.fn().mockResolvedValue({ affected: 1 });
    findOneMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: getRepositoryToken(Session),
          useValue: {
            create: (data) => data,
            save: saveMock,
            update: updateMock,
            findOne: findOneMock,
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(30),
            getOrThrow: jest.fn().mockReturnValue(30),
          },
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  describe('generateRefreshToken', () => {
    it('produce token hex di 96 caratteri (48 bytes)', () => {
      const t = service.generateRefreshToken();
      expect(t).toHaveLength(96);
      expect(t).toMatch(/^[0-9a-f]+$/);
    });

    it('genera token distinti su chiamate successive', () => {
      const a = service.generateRefreshToken();
      const b = service.generateRefreshToken();
      expect(a).not.toBe(b);
    });
  });

  describe('hashToken', () => {
    it('produce sempre lo stesso hash per lo stesso input', () => {
      const t = 'samevalue';
      expect(service.hashToken(t)).toBe(service.hashToken(t));
    });

    it('hash diverso per input diversi', () => {
      expect(service.hashToken('a')).not.toBe(service.hashToken('b'));
    });

    it('produce hash SHA-256 (64 char hex)', () => {
      const h = service.hashToken('test');
      expect(h).toHaveLength(64);
      expect(h).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('create', () => {
    it('non persiste il token in chiaro, solo il suo hash', async () => {
      const { session, rawToken } = await service.create({ userId: 'user-1' });
      expect(rawToken).toHaveLength(96);
      // Il record salvato deve contenere solo l'hash, MAI il rawToken
      const savedArg = saveMock.mock.calls[0][0];
      expect(savedArg.tokenHash).toBe(service.hashToken(rawToken));
      expect(savedArg.tokenHash).not.toBe(rawToken);
      expect(JSON.stringify(savedArg)).not.toContain(rawToken);
      expect(session).toBeDefined();
    });

    it('imposta expires_at nel futuro (30 giorni di TTL)', async () => {
      const now = Date.now();
      await service.create({ userId: 'user-1' });
      const savedArg = saveMock.mock.calls[0][0];
      const diffMs = savedArg.expiresAt.getTime() - now;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThan(29);
      expect(diffDays).toBeLessThan(31);
    });
  });

  describe('findActiveByToken', () => {
    it('cerca per tokenHash, non per il raw token', async () => {
      findOneMock.mockResolvedValue(null);
      const raw = 'somerawtoken';
      await service.findActiveByToken(raw);
      expect(findOneMock).toHaveBeenCalledWith({
        where: { tokenHash: service.hashToken(raw), isActive: true },
      });
    });

    it('ritorna null e revoca se la sessione è scaduta', async () => {
      const expired = {
        id: 's1',
        userId: 'u1',
        tokenHash: 'h',
        isActive: true,
        expiresAt: new Date(Date.now() - 1000),
      };
      findOneMock.mockResolvedValue(expired);
      const result = await service.findActiveByToken('any');
      expect(result).toBeNull();
      expect(updateMock).toHaveBeenCalledWith(
        's1',
        expect.objectContaining({ isActive: false, revokedAt: expect.any(Date) }),
      );
    });
  });
});
