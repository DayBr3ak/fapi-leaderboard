<script>
  export let data;
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>
    {data.title}
	</h1>

  <div class="flex flex-col">
    <div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
        <div class="overflow-hidden">
          <table class="min-w-full text-left text-sm font-light">
            <thead class="border-b font-medium dark:border-neutral-500">
              <tr>
                <th scope="col" class="px-6 py-4">#</th>
                <th scope="col" class="px-6 py-4">Player ID</th>
                <th scope="col" class="px-6 py-4">Name</th>
                <th scope="col" class="px-6 py-4">Score</th>
              </tr>
            </thead>
            <tbody>
              {#each data.item as element, i (element)}
                <tr class="border-b dark:border-neutral-500">
                  <td class="whitespace-nowrap px-6 py-4 font-medium">{i + 1}</td>
                  <td class="whitespace-nowrap px-6 py-4">{element.id}</td>
                  <td class="whitespace-nowrap px-6 py-4">{element.username}</td>
                  <td class="whitespace-nowrap px-6 py-4">{data.getScore(element)}</td>
                </tr> 
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

</section>