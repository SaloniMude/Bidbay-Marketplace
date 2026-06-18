<script setup>
import { ref } from 'vue';
import { registerUser } from '@/composables/useAuth';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleRegister = async () => {
  errorMessage.value = '';

  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill in all fields.';
    return;
  }

  isLoading.value = true;

  try {
    await registerUser(email.value, password.value);
    await navigateTo('/Register-SignIn');
  } catch (error) {
    errorMessage.value = error.message || 'Registration failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6">
    <!-- Register Card -->
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900">Register</h1>
        <p class="text-slate-500 mt-2">Create your Bidbay account</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-6">
        <!-- Email Field -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="your@email.com"
            required
            class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition"
          />
        </div>

        <!-- Password Field -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            minlength="8"
            class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition"
          />
          <p class="text-xs text-slate-500 mt-1">Minimum 8 characters</p>
        </div>

        <!-- Error Message -->
        <p v-if="errorMessage" class="text-red-500 text-sm text-center font-medium">
          {{ errorMessage }}
        </p>

        <!-- Register Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="block w-full text-center bg-violet-600 text-white font-bold py-3 rounded-lg border-2 border-violet-600 hover:bg-white hover:text-violet-600 transition-all duration-300 shadow-md disabled:opacity-50"
        >
          {{ isLoading ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <!-- Register Option -->
      <div class="mt-8 text-center border-t border-slate-100 pt-6">
        <p class="text-slate-600">
          Already have a Bidbay account?
          <NuxtLink to="/Register-SignIn" class="text-violet-700 font-semibold hover:underline">
            Login to account
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
