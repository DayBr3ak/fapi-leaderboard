export async function load({ fetch, params }) {
	const res = await fetch(`/latest/${params.slug}.json`);
	const item = await res.json();


  const res2 = await fetch(`/columns.json`);
	const cols = await res2.json();

  const getScore = (item) => {
    if (params.slug === 'ascensionCount') {
      const cnt = item.ascensionCount;
      const prog = item.ascensionProgress
      return `${cnt} (${prog}%)`;
    }

    return item[params.slug];
  }

  const col = cols.find((x) => x.slug === params.slug) ?? { label: 'NA'}

	return { item, title: col.label, getScore };
}