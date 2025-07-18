import {
  convertTodoFromDB,
  convertTodoToDB,
  convertRitualFromDB,
  convertRitualToDB,
  convertRitualCompleteLogFromDB,
  convertRitualCompleteLogToDB,
  convertRitualGemFromDB,
  convertRitualGemToDB,
  convertRitualCompletionFromDB,
  convertRitualCompletionToDB,
} from '@/lib/remotes/supabase/converters';

describe('Supabase Converters', () => {
  describe('Todo converters', () => {
    test('convertTodoFromDB는 DB 데이터를 Todo 객체로 변환해야 함', () => {
      const dbTodo = {
        id: 1,
        text: 'Test todo',
        color: 'yellow' as const,
        status: 'active' as const,
        is_pinned: false,
        pinned_at: null,
        created_at: '2024-01-01T00:00:00.000Z',
        completed_at: null,
        archived_at: null,
        user_id: 'user123',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const todo = convertTodoFromDB(dbTodo);

      expect(todo).toEqual({
        id: 1,
        text: 'Test todo',
        color: 'yellow',
        status: 'active',
        isPinned: false,
        pinnedAt: undefined,
        createdAt: new Date('2024-01-01T00:00:00.000Z').getTime(),
        completedAt: undefined,
        archivedAt: undefined,
      });
    });

    test('convertTodoFromDB는 완료된 todo를 올바르게 변환해야 함', () => {
      const dbTodo = {
        id: 1,
        text: 'Completed todo',
        color: 'green' as const,
        status: 'completed' as const,
        is_pinned: true,
        pinned_at: '2024-01-01T10:00:00.000Z',
        created_at: '2024-01-01T00:00:00.000Z',
        completed_at: '2024-01-01T12:00:00.000Z',
        archived_at: null,
        user_id: 'user123',
        updated_at: '2024-01-01T12:00:00.000Z',
      };

      const todo = convertTodoFromDB(dbTodo);

      expect(todo.isPinned).toBe(true);
      expect(todo.pinnedAt).toBe(new Date('2024-01-01T10:00:00.000Z').getTime());
      expect(todo.completedAt).toBe(new Date('2024-01-01T12:00:00.000Z').getTime());
    });

    test('convertTodoToDB는 Todo 객체를 DB 형식으로 변환해야 함', () => {
      const todo = {
        id: 1,
        text: 'Test todo',
        color: 'yellow' as const,
        status: 'active' as const,
        isPinned: false,
        createdAt: new Date('2024-01-01T00:00:00.000Z').getTime(),
      };

      const dbTodo = convertTodoToDB(todo, 'user123');

      expect(dbTodo).toEqual({
        user_id: 'user123',
        text: 'Test todo',
        color: 'yellow',
        status: 'active',
        is_pinned: false,
        pinned_at: null,
        created_at: '2024-01-01T00:00:00.000Z',
        completed_at: null,
        archived_at: null,
      });
    });

    test('convertTodoToDB는 완료된 todo를 올바르게 변환해야 함', () => {
      const todo = {
        id: 1,
        text: 'Completed todo',
        color: 'green' as const,
        status: 'completed' as const,
        isPinned: true,
        pinnedAt: new Date('2024-01-01T10:00:00.000Z').getTime(),
        createdAt: new Date('2024-01-01T00:00:00.000Z').getTime(),
        completedAt: new Date('2024-01-01T12:00:00.000Z').getTime(),
      };

      const dbTodo = convertTodoToDB(todo, 'user123');

      expect(dbTodo.is_pinned).toBe(true);
      expect(dbTodo.pinned_at).toBe('2024-01-01T10:00:00.000Z');
      expect(dbTodo.completed_at).toBe('2024-01-01T12:00:00.000Z');
    });
  });

  describe('Ritual converters', () => {
    test('convertRitualFromDB는 DB 데이터를 Ritual 객체로 변환해야 함', () => {
      const dbRitual = {
        id: 1,
        name: 'Test Ritual',
        order_index: 1,
        is_active: true,
        created_at: '2024-01-01T00:00:00.000Z',
        user_id: 'user123',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const ritual = convertRitualFromDB(dbRitual);

      expect(ritual).toEqual({
        id: 1,
        name: 'Test Ritual',
        orderIndex: 1,
        isActive: true,
        createdAt: new Date('2024-01-01T00:00:00.000Z').getTime(),
      });
    });

    test('convertRitualToDB는 Ritual 객체를 DB 형식으로 변환해야 함', () => {
      const ritual = {
        id: 1,
        name: 'Test Ritual',
        orderIndex: 1,
        isActive: true,
        createdAt: new Date('2024-01-01T00:00:00.000Z').getTime(),
      };

      const dbRitual = convertRitualToDB(ritual, 'user123');

      expect(dbRitual).toEqual({
        user_id: 'user123',
        name: 'Test Ritual',
        order_index: 1,
        is_active: true,
        created_at: '2024-01-01T00:00:00.000Z',
      });
    });
  });

  describe('RitualCompleteLog converters', () => {
    test('convertRitualCompleteLogFromDB는 DB 데이터를 RitualCompleteLog 객체로 변환해야 함', () => {
      const dbLog = {
        id: 1,
        user_id: 'user123',
        ritual_id: 5,
        completed_at: '2024-01-01T12:00:00.000Z',
        created_at: '2024-01-01T12:00:00.000Z',
      };

      const log = convertRitualCompleteLogFromDB(dbLog);

      expect(log).toEqual({
        id: 1,
        userId: 'user123',
        ritualId: 5,
        completedAt: new Date('2024-01-01T12:00:00.000Z').getTime(),
        createdAt: new Date('2024-01-01T12:00:00.000Z').getTime(),
      });
    });

    test('convertRitualCompleteLogToDB는 RitualCompleteLog 객체를 DB 형식으로 변환해야 함', () => {
      const log = {
        id: 1,
        userId: 'user123',
        ritualId: 5,
        completedAt: new Date('2024-01-01T12:00:00.000Z').getTime(),
        createdAt: new Date('2024-01-01T12:00:00.000Z').getTime(),
      };

      const dbLog = convertRitualCompleteLogToDB(log, 'user123');

      expect(dbLog).toEqual({
        user_id: 'user123',
        ritual_id: 5,
        completed_at: '2024-01-01T12:00:00.000Z',
        created_at: '2024-01-01T12:00:00.000Z',
      });
    });
  });

  describe('RitualGem converters', () => {
    test('convertRitualGemFromDB는 DB 데이터를 RitualGem 객체로 변환해야 함', () => {
      const dbGem = {
        id: 1,
        user_id: 'user123',
        date: '2024-01-01',
        created_at: '2024-01-01T00:00:00.000Z',
        is_archived: false,
        archived_at: null,
      };

      const gem = convertRitualGemFromDB(dbGem);

      expect(gem).toEqual({
        id: 1,
        userId: 'user123',
        date: '2024-01-01',
        createdAt: new Date('2024-01-01T00:00:00.000Z').getTime(),
        isArchived: false,
        archivedAt: undefined,
      });
    });

    test('convertRitualGemToDB는 RitualGem 객체를 DB 형식으로 변환해야 함', () => {
      const gem = {
        id: 1,
        userId: 'user123',
        date: '2024-01-01',
        createdAt: new Date('2024-01-01T00:00:00.000Z').getTime(),
        isArchived: false,
        totalRituals: 3,
        completedRituals: 3,
      };

      const dbGem = convertRitualGemToDB(gem, 'user123');

      expect(dbGem).toEqual({
        user_id: 'user123',
        date: '2024-01-01',
        created_at: '2024-01-01T00:00:00.000Z',
        is_archived: false,
        archived_at: undefined,
      });
    });
  });

  describe('RitualCompletion converters', () => {
    test('convertRitualCompletionFromDB는 DB 데이터를 RitualCompletion 객체로 변환해야 함', () => {
      const dbCompletion = {
        id: 1,
        user_id: 'user123',
        date: '2024-01-01',
        completed_ritual_ids: [1, 2, 3],
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T12:00:00.000Z',
        is_archived: false,
        archived_at: null,
      };

      const completion = convertRitualCompletionFromDB(dbCompletion);

      expect(completion).toEqual({
        id: 1,
        userId: 'user123',
        date: '2024-01-01',
        completedRitualIds: [1, 2, 3],
        createdAt: new Date('2024-01-01T00:00:00.000Z').getTime(),
        updatedAt: new Date('2024-01-01T12:00:00.000Z').getTime(),
        isArchived: false,
        archivedAt: undefined,
      });
    });

    test('convertRitualCompletionToDB는 RitualCompletion 객체를 DB 형식으로 변환해야 함', () => {
      const completion = {
        id: 1,
        userId: 'user123',
        date: '2024-01-01',
        completedRitualIds: [1, 2, 3],
        createdAt: new Date('2024-01-01T00:00:00.000Z').getTime(),
        updatedAt: new Date('2024-01-01T12:00:00.000Z').getTime(),
        isArchived: false,
      };

      const dbCompletion = convertRitualCompletionToDB(completion, 'user123');

      expect(dbCompletion).toEqual({
        user_id: 'user123',
        date: '2024-01-01',
        completed_ritual_ids: [1, 2, 3],
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T12:00:00.000Z',
        is_archived: false,
        archived_at: undefined,
      });
    });
  });
});