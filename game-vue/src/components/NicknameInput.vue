<script setup lang="ts">
import { ref } from 'vue'
import { useLeaderboardStore } from '../stores/leaderboardStore'

const leaderboardStore = useLeaderboardStore()
const nickname = ref('')
const error = ref('')

const emit = defineEmits<{
  ready: []
}>()

function handleSubmit() {
  // Validate nickname
  const trimmed = nickname.value.trim()

  if (!trimmed) {
    error.value = 'Please enter a nickname'
    return
  }

  if (trimmed.length < 2) {
    error.value = 'Nickname must be at least 2 characters'
    return
  }

  if (trimmed.length > 20) {
    error.value = 'Nickname must be less than 20 characters'
    return
  }

  // Set nickname in store
  leaderboardStore.setNickname(trimmed)
  error.value = ''

  // Emit ready event
  emit('ready')
}
</script>

<template>
	<div class="max-w-md w-full mx-auto">
		<div class="bg-gray-800 rounded-xl p-8 shadow-2xl">
			<h2 class="text-3xl font-bold mb-6 text-center">Enter Your Nickname</h2>

			<form @submit.prevent="handleSubmit" class="space-y-4">
				<div>
					<input
						v-model="nickname"
						type="text"
						placeholder="Your nickname..."
						maxlength="20"
						class="w-full px-4 py-3 bg-gray-700 text-white rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-primary
                   placeholder-gray-400"
						autofocus
					/>
					<p v-if="error" class="text-red-400 text-sm mt-2">
						{{ error }}
					</p>
				</div>

				<button type="submit" class="btn btn-primary w-full text-xl py-4">🎮 Start Playing</button>
			</form>

			<p class="text-gray-500 text-sm text-center mt-4">Your scores will appear on the global leaderboard</p>
		</div>
	</div>
</template>
