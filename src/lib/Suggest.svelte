<script lang="ts">
  let {
    name,
    label,
    placeholder,
    field,
    value = $bindable(""),
    application = "",
    required = false,
  }: {
    name: string;
    label: string;
    placeholder: string;
    field: "application" | "principal" | "relation" | "object";
    value?: string;
    application?: string;
    required?: boolean;
  } = $props();

  const listId = `suggest-${name}`;
  let items = $state<string[]>([]);
  let open = $state(false);
  let note = $state("");
  let active = $state(-1);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let controller: AbortController | undefined;

  async function load() {
    controller?.abort();
    active = -1;
    if (field !== "application" && !application.trim()) {
      items = [];
      note = "Choose an application first.";
      return;
    }
    controller = new AbortController();
    const params = new URLSearchParams({ field, q: value });
    if (field !== "application") params.set("application", application);
    try {
      const res = await fetch(`/explorer/suggest?${params}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(String(res.status));
      items = ((await res.json()) as { items: string[] }).items;
      note = "";
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      items = [];
      note = "Suggestions unavailable.";
    }
  }

  function ask() {
    open = true;
    clearTimeout(timer);
    timer = setTimeout(load, 150);
  }

  function choose(item: string) {
    value = item;
    open = false;
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      open = false;
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!open) return ask();
      e.preventDefault();
      if (items.length === 0) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      active = (active + step + items.length) % items.length;
    } else if (e.key === "Enter" && open && items[active] !== undefined) {
      e.preventDefault();
      choose(items[active]);
    }
  }
</script>

<div class="suggest">
  <input
    {name}
    {placeholder}
    {required}
    bind:value
    role="combobox"
    aria-label={label}
    aria-expanded={open}
    aria-controls={listId}
    aria-autocomplete="list"
    aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
    autocomplete="off"
    oninput={ask}
    onfocus={ask}
    onblur={() => (open = false)}
    {onkeydown}
  />
  {#if open && (items.length > 0 || note)}
    <ul id={listId} role="listbox" aria-label={`${label} suggestions`}>
      {#if note}
        <li role="presentation" class="note">{note}</li>
      {/if}
      {#each items as item, i (item)}
        <li
          id={`${listId}-${i}`}
          role="option"
          aria-selected={i === active}
          class:active={i === active}
          onmousedown={(e) => {
            e.preventDefault();
            choose(item);
          }}
        >
          {item}
        </li>
      {/each}
    </ul>
  {/if}
</div>
