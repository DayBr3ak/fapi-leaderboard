export const prerender = true;
export async function load({ fetch, params }) {
  const res2 = await fetch(`/columns.json`);
	const cols = await res2.json();

  const colsz = cols.filter(x => x.slug !== 'highestArea')

	return { cols: colsz };
}