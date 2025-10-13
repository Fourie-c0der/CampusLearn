const { saveTopic } = require('../lib/topics');
const mockInsert = jest.fn();

jest.mock('@supabase/supabase-js', () => {
    return {
        createClient: jest.fn(() => ({
            from: jest.fn(() => ({
                insert: mockInsert
            }))
        }))
    };
}
);

describe('saveTopic', () => {
    beforeEach(() => {
        mockInsert.mockReset();
    });
    it('should save a topic successfully', async () => {
        const topicData = { title: 'Test Topic', description: 'This is a test topic.' };
        mockInsert.mockResolvedValue({ data: { id: 1, ...topicData }, error: null });
        const result = await saveTopic(topicData);
        expect(result).toEqual({ id: 1, ...topicData });
        expect(mockInsert).toHaveBeenCalledWith(topicData);
    }
    );
    it('should handle errors when saving a topic', async () => {
        const topicData = { title: 'Test Topic', description: 'This is a test topic.' };
        mockInsert.mockResolvedValue({ data: null, error: { message: 'Insert failed' } });
        await expect(saveTopic(topicData)).rejects.toThrow('Insert failed');
        expect(mockInsert).toHaveBeenCalledWith(topicData);
    }   
    );
});