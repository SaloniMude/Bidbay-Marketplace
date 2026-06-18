<script setup>
import { onMounted, computed } from 'vue'

const router = useRouter()
const route = useRoute()
const isSellRoute = computed(() => route.path.startsWith('/dashboard/sell'))

onMounted(() => {
  if (route.path === '/dashboard') {
    navigateTo('/dashboard/sell/my-items')
  }
})

const handleLogout = () => {
  logoutUser() //from useAuth.js, which clears the hardcoded user session
  router.push('/')
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-64px)] bg-slate-50">
    <aside
      class="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between min-h-[calc(100vh-64px)]"
    >
      <div class="p-6">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Dashboard Menu
        </h2>
        <nav class="space-y-1">
          <NuxtLink
            to="/dashboard/sell/my-items"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition"
            :class="isSellRoute ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
            active-class="bg-violet-50 text-violet-700 font-semibold"
            exact-active-class="bg-violet-50 text-violet-700 font-semibold"
          >
            <IconsMyItems class="w-6 h-6 text-slate-500" />
            <span>Sell Items</span>
          </NuxtLink>

          <!-- Bids Placed -->
          <NuxtLink
            to="/dashboard/bids"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            exact-active-class="bg-violet-50 text-violet-700 font-semibold"
          >
            <IconsBidsPlaced class="w-6 h-6 text-slate-500" />
            <span>Bids Placed</span>
        </NuxtLink>
        </nav>
      </div>

      <div class="p-6 border-t border-slate-100">
        <button
          @click="handleLogout"
          class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition text-left cursor-pointer"
        >
          <IconsLogout/>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <main class="flex-1 p-8">
      <NuxtPage />
    </main>
  </div>
</template>
