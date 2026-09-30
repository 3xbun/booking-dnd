<template>
  <div class="container">
    <!-- Header Section -->
    <header class="dashboard-header">
      <div class="logo-wrapper">
        <img class="logo" src="/logo.png" alt="logo" />
      </div>
      <div class="header-text">
        <h1>Board Game Booking & Schedule System</h1>
        <p class="subtitle">
          <i class="fa-duotone fa-solid fa-circle-check text-success"></i>
          Real-time schedule data for customers
        </p>
      </div>
    </header>

    <!-- Navigation -->
    <nav class="main-nav">
      <RouterLink :to="{ name: 'calendar' }" class="nav-link"
        :class="{ 'nav-link-active': $route.name === 'calendar' }">
        <i class="fa-duotone fa-solid fa-calendar-days"></i>
        <span>Calendar</span>
      </RouterLink>
      <RouterLink :to="{ name: 'adventures' }" class="nav-link"
        :class="{ 'nav-link-active': $route.name === 'adventures' }">
        <i class="fa-duotone fa-solid fa-dice-d20"></i>
        <span>Adventures</span>
      </RouterLink>
    </nav>

    <!-- Routed Views -->
    <RouterView v-slot="{ Component }">
      <Transition name="view-fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>
</template>

<script setup>
</script>

<style scoped>
.dashboard-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: var(--dark-card);
  padding: 1.25rem 2rem;
  border-radius: 1rem;
  border: 1px solid var(--dark-border);
}

.logo-wrapper {
  background: rgba(255, 255, 255, 0.03);
  padding: 0.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 4.5rem;
}

.header-text h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--white);
  margin-bottom: 0.25rem;
}

.subtitle {
  font-size: 0.95rem;
  color: var(--dark-text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.text-success {
  color: #10b981;
}

/* Navigation */
.main-nav {
  display: flex;
  gap: 0.5rem;
  background: var(--dark-card);
  border: 1px solid var(--dark-border);
  border-radius: 1rem;
  padding: 0.5rem;
  margin-top: 2rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  border-radius: 0.6rem;
  color: var(--dark-text-secondary);
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition:
    color 0.2s,
    background 0.2s;
}

.nav-link:hover {
  color: var(--white);
  background: rgba(255, 255, 255, 0.04);
}

.nav-link-active {
  color: var(--white) !important;
  background: rgba(220, 39, 44, 0.12);
  box-shadow: inset 0 0 0 1px rgba(220, 39, 44, 0.4);
}

.nav-link-active i {
  color: var(--primary);
}

/* View transition */
.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.2s ease;
}

.view-fade-enter-from,
.view-fade-leave-to {
  opacity: 0;
}
</style>
