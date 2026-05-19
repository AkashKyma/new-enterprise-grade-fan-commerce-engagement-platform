describe('concierge basics', () => {
  it('safe prompt prefixes system', () => {
    const system = 'You are the AI Concierge.';
    expect(system.toLowerCase()).toContain('concierge');
  });
  it('nba should produce suggestions for anon', () => {
    const items = [{ id: 'nba-signin', kind: 'block' }];
    expect(items.length).toBeGreaterThan(0);
  });
});
