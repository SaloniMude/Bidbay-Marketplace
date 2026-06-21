<script setup>
// Centralized list of your marketplace categories.
const categories = ref(['electronics', 'collectibles', 'furniture']);

const currentUser = useCurrentUser();
</script>

<template>
  <nav class="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <!-- Logo -->
        <div class="flex-shrink-0 flex items-center">
          <NuxtLink to="/" class="text-2xl font-bold text-violet-600 tracking-tight">
            Bidbay
          </NuxtLink>
        </div>

        <!-- Navigation Links -->
        <div class="hidden md:flex space-x-8 items-center">
          <NuxtLink
            to="/"
            class="text-sm font-medium text-slate-600 hover:text-violet-600 transition"
            >Home</NuxtLink
          >
          <ul class="nav-links">
            <li v-for="cat in categories" :key="cat">
              <NuxtLink
                :to="`/category/${cat}`"
                class="text-sm font-medium text-slate-600 hover:text-violet-600 text-transform: capitalize transition"
                active-class="active-link"
              >
                {{ cat }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!--  User Auth  -->
        <div class="flex items-center">
          <template v-if="currentUser">
            <!-- Logged In  -->
            <NuxtLink
              to="/dashboard"
              class="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition"
            >
              <div
                class="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold"
              >
                {{ currentUser.username.charAt(0).toUpperCase() }}
              </div>
              <span class="text-sm font-semibold text-slate-700">{{ currentUser.username }}</span>
            </NuxtLink>
          </template>

          <template v-else>
            <!-- Logged Out -->
            <NuxtLink
              to="/Register-SignIn"
              class="bg-violet-600 text-white px-6 py-2 rounded-lg text-sm font-semibold border-2 border-violet-600 hover:bg-white hover:text-violet-600 transition-all duration-300 shadow-sm inline-block"
            >
              Sign In
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.nav-links {
  display: flex;
  list-style: none;
  gap: 24px;
  margin: 0;
  padding: 0;
}
</style>
