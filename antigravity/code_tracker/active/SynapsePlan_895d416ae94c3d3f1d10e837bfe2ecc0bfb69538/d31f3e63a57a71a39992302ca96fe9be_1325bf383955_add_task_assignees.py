°"""Add task assignees

Revision ID: 1325bf383955
Revises: 1325bf383954
Create Date: 2025-12-15 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1325bf383955'
down_revision: Union[str, Sequence[str], None] = '1325bf383954'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('task_assignees',
        sa.Column('task_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('task_id', 'user_id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('task_assignees')
°"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382ofile:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/alembic/versions/1325bf383955_add_task_assignees.py:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan