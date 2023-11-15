"""update user db

Revision ID: 12b840de1ba0
Revises: d22533c83a2f
Create Date: 2023-11-15 11:33:30.195494

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '12b840de1ba0'
down_revision = 'd22533c83a2f'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('ascii_img', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=mysql.INTEGER(display_width=11),
               type_=sa.String(length=36),
               existing_nullable=False)

    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=mysql.INTEGER(display_width=11),
               type_=sa.String(length=36),
               existing_nullable=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.String(length=36),
               type_=mysql.INTEGER(display_width=11),
               existing_nullable=False)

    with op.batch_alter_table('ascii_img', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.String(length=36),
               type_=mysql.INTEGER(display_width=11),
               existing_nullable=False)

    # ### end Alembic commands ###