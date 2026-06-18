<script setup>
import { ref } from 'vue';
import { loginUser, useCurrentUser } from '@/composables/useAuth';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);
const currentUser = useCurrentUser();

const handleLogin = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill in all fields.';
    return;
  }

  isLoading.value = true;

  try {
    await loginUser(email.value, password.value);
    successMessage.value = `Welcome back ${currentUser.value.username}!`;
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Show message for 1.5s
    await navigateTo('/dashboard');
  } catch (error) {
    errorMessage.value = error.message || 'Login failed. Please check your credentials.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900">Login</h1>
      </div>

      <!-- error message -->
      <p v-if="errorMessage" class="text-red-500 text-sm text-center mb-4 font-medium">
        {{ errorMessage }}
      </p>

      <!-- success message -->
      <p v-if="successMessage" class="text-green-500 text-sm text-center mb-4 font-medium">
        {{ successMessage }}
      </p>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-violet-500 outline-none transition"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-violet-500 outline-none transition"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="block w-full text-center bg-violet-600 text-white font-bold py-3 rounded-lg border-2 border-violet-600 hover:bg-white hover:text-violet-600 transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50"
        >
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <!-- Register Option -->
      <div class="mt-8 text-center border-t border-slate-100 pt-6">
        <p class="text-slate-600">
          New to Bidbay?
          <NuxtLink to="/register" class="text-violet-700 font-semibold hover:underline">
            Create an account
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped></style>
