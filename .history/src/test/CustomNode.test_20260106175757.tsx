import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CustomNode from '@/components/skill-tree/CustomNode';
import { SkillData } from '@/types';

describe('CustomNode', () => {
  const mockSkillData: SkillData = {
    id: 'test-skill',
    title: 'Test Skill',
    description: 'Test description',
    tier: 'foundation',
    category: 'frontend',
    status: 'available',
    prerequisites: [],
    xpReward: 100,
    resources: [],
  };

  it('renders skill title', () => {
    render(
      <CustomNode
        id="test-1"
        data={mockSkillData}
        selected={false}
        type="skill"
        xPos={0}
        yPos={0}
        zIndex={1}
        isConnectable={true}
        dragging={false}
      />
    );

    expect(screen.getByText('Test Skill')).toBeInTheDocument();
  });

  it('shows locked state for locked skills', () => {
    const lockedData = { ...mockSkillData, status: 'locked' as const };
    render(
      <CustomNode
        id="test-2"
        data={lockedData}
        selected={false}
        type="skill"
        xPos={0}
        yPos={0}
        zIndex={1}
        isConnectable={true}
        dragging={false}
      />
    );

    // Locked skills should have a lock icon
    const lockIcon = screen.getByRole('img', { hidden: true });
    expect(lockIcon).toBeInTheDocument();
  });

  it('applies selection styles when selected', () => {
    const { container } = render(
      <CustomNode
        id="test-3"
        data={mockSkillData}
        selected={true}
        type="skill"
        xPos={0}
        yPos={0}
        zIndex={1}
        isConnectable={true}
        dragging={false}
      />
    );

    const node = container.firstChild as HTMLElement;
    expect(node).toHaveClass('ring-2', 'ring-white');
  });
});
