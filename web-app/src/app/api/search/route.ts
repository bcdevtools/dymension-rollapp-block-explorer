import { handleGlobalSearchOnServer } from '@/services/db/search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchValue = searchParams.get('value')?.trim();

  if (!searchValue)
    return new Response('Invalid Search Value', { status: 400 });

  const result = await handleGlobalSearchOnServer(searchValue);

  return Response.json(result);
}
