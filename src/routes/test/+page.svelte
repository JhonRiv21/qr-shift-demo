<script lang="ts">
  let { data } = $props();
</script>

<div class="p-6">
  <h1 class="text-2xl font-bold mb-4">Prueba de Conexión</h1>
  
  <pre class="bg-gray-100 p-4 rounded">
    {JSON.stringify(data, null, 2)}
  </pre>
</div> 