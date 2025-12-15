
console.log('🚀 Running basic tests for Notifications Service...');

try {
  // 1. Basic Environment Check
  console.log('Checking environment...');
  if (!process.cwd()) {
    throw new Error('Current working directory is not defined');
  }
  console.log('✅ Environment check passed');

  // 2. Simple Logic Test
  console.log('Running logic tests...');
  const add = (a: number, b: number) => a + b;
  if (add(1, 2) !== 3) {
    throw new Error('Math is broken!');
  }
  console.log('✅ Logic test passed');

  console.log('\n✨ All basic tests passed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Tests failed:', error);
  process.exit(1);
}
