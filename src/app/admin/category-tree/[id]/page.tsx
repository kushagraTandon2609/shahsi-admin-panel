import CategoryEditPage from '../shared/CategoryEditPage';

type EditCategoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;

  return <CategoryEditPage mode="edit" categoryId={id} />;
}