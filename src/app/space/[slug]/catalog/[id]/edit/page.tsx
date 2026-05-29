import { notFound, redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import EditForm from './EditForm';

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function EditCatalogItemPage({ params }: PageProps) {
  const { slug, id } = await params;
  const supabase = await supabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: biz } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!biz) notFound();

  const { data: item } = await supabase
    .from('catalog_items')
    .select('id, name, description, category, price, is_demo, active')
    .eq('id', id)
    .eq('business_id', biz.id)
    .maybeSingle();

  if (!item) notFound();

  return <EditForm slug={slug} item={item} />;
}
