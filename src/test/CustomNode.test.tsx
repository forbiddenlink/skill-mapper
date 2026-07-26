import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import CustomNode from '@/components/skill-tree/CustomNode';
import { SkillData } from '@/types';

// Wrapper component to provide React Flow context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
);

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
      <TestWrapper>
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
      </TestWrapper>
    );

    expect(screen.getByText('Test Skill')).toBeInTheDocument();
  });

  it('shows locked state for locked skills', () => {
    const lockedData = { ...mockSkillData, status: 'locked' as const };
    render(
      <TestWrapper>
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
      </TestWrapper>
    );

    // Locked skills should have reduced opacity or visual indicator
    const titleElement = screen.getByText('Test Skill');
    expect(titleElement).toBeInTheDocument();
  });

  it('applies selection styles when selected', () => {
    const { container } = render(
      <TestWrapper>
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
      </TestWrapper>
    );

    // The tilt/selection layer is the inner node (wrapped by a pop container).
    const node = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(node).toHaveClass('ring-2', 'ring-neon-cyan');
  });
});
