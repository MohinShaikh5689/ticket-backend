import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── Agents ────────────────────────────────────────
  const agents = await Promise.all([
    prisma.agent.upsert({
      where: { email: 'admin@replink.io' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Sarah Chen',
        email: 'admin@replink.io',
        role: 'ADMIN',
        isActive: true,
      },
    }),
    prisma.agent.upsert({
      where: { email: 'alex.jones@replink.io' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Alex Jones',
        email: 'alex.jones@replink.io',
        role: 'AGENT',
        isActive: true,
      },
    }),
    prisma.agent.upsert({
      where: { email: 'maya.patel@replink.io' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'Maya Patel',
        email: 'maya.patel@replink.io',
        role: 'AGENT',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${agents.length} agents`);

  // ─── Customers ─────────────────────────────────────
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { email: 'john@acmecorp.com' },
      update: {},
      create: {
        name: 'John Mitchell',
        email: 'john@acmecorp.com',
        company: 'Acme Corp',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'lisa@techstart.io' },
      update: {},
      create: {
        name: 'Lisa Wang',
        email: 'lisa@techstart.io',
        company: 'TechStart.io',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'carlos@bigretail.com' },
      update: {},
      create: {
        name: 'Carlos Rivera',
        email: 'carlos@bigretail.com',
        company: 'Big Retail Inc',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'emma@designhub.co' },
      update: {},
      create: {
        name: 'Emma Thompson',
        email: 'emma@designhub.co',
        company: 'DesignHub',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'raj@finflow.dev' },
      update: {},
      create: {
        name: 'Raj Sharma',
        email: 'raj@finflow.dev',
        company: 'FinFlow',
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} customers`);

  // ─── Tickets ───────────────────────────────────────
  const tickets = await Promise.all([
    prisma.ticket.create({
      data: {
        title: 'Cannot access billing dashboard',
        description:
          'After upgrading to the Pro plan, I can no longer view my billing invoices. The page shows a blank white screen. This is urgent as we need the invoices for our quarterly report deadline.',
        status: 'OPEN',
        priority: 'HIGH',
        customerId: customers[0].id,
        assignedAgentId: agents[1].id,
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Feature request: Dark mode support',
        description:
          'Our team works late hours and would really appreciate a dark mode option in the dashboard. Many modern apps support this and it would reduce eye strain.',
        status: 'OPEN',
        priority: 'LOW',
        customerId: customers[1].id,
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Login fails with SSO - "Invalid credentials" error',
        description:
          'Since yesterday morning, our entire team cannot login using SSO. We get an "Invalid credentials" error every time. This is blocking all our work. We need this fixed immediately!',
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        customerId: customers[2].id,
        assignedAgentId: agents[0].id,
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Slow page load times on analytics dashboard',
        description:
          'The analytics dashboard takes 15-20 seconds to load. It used to load in under 3 seconds. This started happening after last week\'s update.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        customerId: customers[3].id,
        assignedAgentId: agents[2].id,
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Export CSV produces empty file',
        description:
          'When I try to export my data to CSV, the downloaded file is empty (0 bytes). I have tried different date ranges and different data sets but the result is always the same.',
        status: 'WAITING_ON_CUSTOMER',
        priority: 'MEDIUM',
        customerId: customers[4].id,
        assignedAgentId: agents[1].id,
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Request for API rate limit increase',
        description:
          'We are hitting the 1000 requests/hour API rate limit. Our application has grown and we need at least 5000 requests/hour. Can we get an upgrade?',
        status: 'OPEN',
        priority: 'MEDIUM',
        customerId: customers[0].id,
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Webhook notifications not being delivered',
        description:
          'We configured webhooks for ticket status changes but are not receiving any notifications. Our endpoint is working fine - tested with other services.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        customerId: customers[1].id,
        assignedAgentId: agents[1].id,
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Thank you for the great support!',
        description:
          'I just wanted to say thank you for the excellent support experience. Your team resolved my previous issue within an hour. The product is wonderful and your team is amazing.',
        status: 'RESOLVED',
        priority: 'LOW',
        customerId: customers[3].id,
        assignedAgentId: agents[2].id,
        resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Billing overcharge on last invoice',
        description:
          'I was charged $299 instead of $99 on my latest invoice. This is unacceptable and I am very frustrated. I want an immediate refund. If this is not resolved today I will cancel my subscription.',
        status: 'OPEN',
        priority: 'HIGH',
        customerId: customers[2].id,
        assignedAgentId: agents[0].id,
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'How to integrate with Slack?',
        description:
          'We would like to integrate your product with our Slack workspace. Is there documentation on how to set up the Slack integration? We appreciate any help.',
        status: 'CLOSED',
        priority: 'LOW',
        customerId: customers[4].id,
        assignedAgentId: agents[2].id,
        resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
    }),
  ]);

  console.log(`✅ Created ${tickets.length} tickets`);

  // ─── Comments ──────────────────────────────────────
  const comments = await Promise.all([
    // Ticket 0: billing dashboard
    prisma.comment.create({
      data: {
        content: 'I can reproduce this issue. Checking the billing service logs now.',
        isInternal: true,
        ticketId: tickets[0].id,
        agentId: agents[1].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Found the issue — the Pro plan permission set is missing the billing.read scope. Escalating to engineering.',
        isInternal: true,
        ticketId: tickets[0].id,
        agentId: agents[1].id,
      },
    }),
    // Ticket 2: SSO login
    prisma.comment.create({
      data: {
        content: 'Confirmed — SSO provider certificate expired. Renewing now.',
        isInternal: true,
        ticketId: tickets[2].id,
        agentId: agents[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Certificate renewed. Please try logging in again and let us know if the issue persists.',
        isInternal: false,
        ticketId: tickets[2].id,
        agentId: agents[0].id,
      },
    }),
    // Ticket 3: slow page load
    prisma.comment.create({
      data: {
        content: 'Running performance profiling on the analytics queries. Initial findings show the new aggregation query is doing a full table scan.',
        isInternal: true,
        ticketId: tickets[3].id,
        agentId: agents[2].id,
      },
    }),
    // Ticket 4: CSV export
    prisma.comment.create({
      data: {
        content: 'Could you provide your account ID and the exact date range you are trying to export? This will help us investigate.',
        isInternal: false,
        ticketId: tickets[4].id,
        agentId: agents[1].id,
      },
    }),
    // Ticket 6: webhooks
    prisma.comment.create({
      data: {
        content: 'Checking webhook delivery logs in the queue service.',
        isInternal: true,
        ticketId: tickets[6].id,
        agentId: agents[1].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Found the issue — webhook queue worker crashed 3 days ago and didn\'t restart. Restarting and replaying failed deliveries.',
        isInternal: true,
        ticketId: tickets[6].id,
        agentId: agents[1].id,
      },
    }),
    // Ticket 7: thank you
    prisma.comment.create({
      data: {
        content: 'Thank you so much for the kind words! We\'re glad we could help. Don\'t hesitate to reach out anytime.',
        isInternal: false,
        ticketId: tickets[7].id,
        agentId: agents[2].id,
      },
    }),
    // Ticket 8: billing overcharge
    prisma.comment.create({
      data: {
        content: 'Reviewing the billing records. Looks like the customer was double-charged due to a failed payment retry.',
        isInternal: true,
        ticketId: tickets[8].id,
        agentId: agents[0].id,
      },
    }),
    // Ticket 9: Slack integration
    prisma.comment.create({
      data: {
        content: 'Here\'s the link to our Slack integration docs: https://docs.example.com/integrations/slack. Let me know if you have any questions!',
        isInternal: false,
        ticketId: tickets[9].id,
        agentId: agents[2].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'That worked perfectly, thank you!',
        isInternal: false,
        ticketId: tickets[9].id,
        agentId: agents[2].id, // Simulating customer reply via agent
      },
    }),
  ]);

  console.log(`✅ Created ${comments.length} comments`);

  // ─── Status History ────────────────────────────────
  const statusHistory = await Promise.all([
    // Ticket 2: OPEN → IN_PROGRESS
    prisma.ticketStatusHistory.create({
      data: {
        ticketId: tickets[2].id,
        oldStatus: 'OPEN',
        newStatus: 'IN_PROGRESS',
        changedByAgentId: agents[0].id,
        reason: 'Investigating SSO certificate issue',
      },
    }),
    // Ticket 3: OPEN → IN_PROGRESS
    prisma.ticketStatusHistory.create({
      data: {
        ticketId: tickets[3].id,
        oldStatus: 'OPEN',
        newStatus: 'IN_PROGRESS',
        changedByAgentId: agents[2].id,
        reason: 'Running performance profiling',
      },
    }),
    // Ticket 4: OPEN → IN_PROGRESS → WAITING_ON_CUSTOMER
    prisma.ticketStatusHistory.create({
      data: {
        ticketId: tickets[4].id,
        oldStatus: 'OPEN',
        newStatus: 'IN_PROGRESS',
        changedByAgentId: agents[1].id,
        reason: 'Attempting to reproduce',
      },
    }),
    prisma.ticketStatusHistory.create({
      data: {
        ticketId: tickets[4].id,
        oldStatus: 'IN_PROGRESS',
        newStatus: 'WAITING_ON_CUSTOMER',
        changedByAgentId: agents[1].id,
        reason: 'Need more info from customer',
      },
    }),
    // Ticket 7: OPEN → RESOLVED
    prisma.ticketStatusHistory.create({
      data: {
        ticketId: tickets[7].id,
        oldStatus: 'OPEN',
        newStatus: 'RESOLVED',
        changedByAgentId: agents[2].id,
        reason: 'Positive feedback — no action needed',
      },
    }),
    // Ticket 9: OPEN → IN_PROGRESS → RESOLVED → CLOSED
    prisma.ticketStatusHistory.create({
      data: {
        ticketId: tickets[9].id,
        oldStatus: 'OPEN',
        newStatus: 'IN_PROGRESS',
        changedByAgentId: agents[2].id,
        reason: 'Providing integration documentation',
      },
    }),
    prisma.ticketStatusHistory.create({
      data: {
        ticketId: tickets[9].id,
        oldStatus: 'IN_PROGRESS',
        newStatus: 'RESOLVED',
        changedByAgentId: agents[2].id,
        reason: 'Customer confirmed integration works',
      },
    }),
    prisma.ticketStatusHistory.create({
      data: {
        ticketId: tickets[9].id,
        oldStatus: 'RESOLVED',
        newStatus: 'CLOSED',
        changedByAgentId: agents[2].id,
        reason: 'No follow-up needed',
      },
    }),
  ]);

  console.log(`✅ Created ${statusHistory.length} status history records`);

  // ─── AI Insights ───────────────────────────────────
  const aiInsights = await Promise.all([
    // Ticket 0: billing dashboard (high confidence)
    prisma.aIInsight.create({
      data: {
        ticketId: tickets[0].id,
        summary: 'Customer lost access to billing dashboard after plan upgrade. Likely a permission/scope misconfiguration in the Pro plan setup.',
        suggestedPriority: 'HIGH',
        sentiment: 'FRUSTRATED',
        nextAction: 'Review billing account and recent invoices. Check payment processing logs.',
        confidenceScore: 0.85,
        version: 1,
      },
    }),
    // Ticket 2: SSO login (critical, high confidence)
    prisma.aIInsight.create({
      data: {
        ticketId: tickets[2].id,
        summary: 'Entire team blocked from SSO login. Certificate-related authentication failure affecting all users at Big Retail Inc.',
        suggestedPriority: 'CRITICAL',
        sentiment: 'ANGRY',
        nextAction: 'Check auth logs for failed login attempts. Verify account status.',
        confidenceScore: 0.92,
        version: 1,
      },
    }),
    // Ticket 3: slow page loads (medium confidence)
    prisma.aIInsight.create({
      data: {
        ticketId: tickets[3].id,
        summary: 'Analytics dashboard performance degraded significantly after recent update. Load times increased from 3s to 15-20s.',
        suggestedPriority: 'HIGH',
        sentiment: 'FRUSTRATED',
        nextAction: 'Check system performance metrics. Review recent deployments for regressions.',
        confidenceScore: 0.78,
        version: 1,
      },
    }),
    // Ticket 8: billing overcharge (high confidence, edited by agent)
    prisma.aIInsight.create({
      data: {
        ticketId: tickets[8].id,
        summary: 'Customer overcharged $200 on latest invoice. High frustration with threat to cancel. Requires immediate billing review and potential refund.',
        suggestedPriority: 'CRITICAL',
        sentiment: 'ANGRY',
        nextAction: 'Review refund policy. Check payment history for eligible transactions.',
        confidenceScore: 0.88,
        version: 1,
        isEdited: true,
        editedSummary: 'Double-charge confirmed due to failed payment retry. Issue refund of $200 and send apology email with 1-month credit.',
        editedByAgentId: agents[0].id,
        editedAt: new Date(),
      },
    }),
    // Ticket 1: feature request (low confidence)
    prisma.aIInsight.create({
      data: {
        ticketId: tickets[1].id,
        summary: 'Feature request for dark mode. Non-urgent enhancement request.',
        suggestedPriority: 'LOW',
        sentiment: 'NEUTRAL',
        nextAction: 'Log feature request. Check product roadmap for related items.',
        confidenceScore: 0.45,
        version: 1,
      },
    }),
  ]);

  console.log(`✅ Created ${aiInsights.length} AI insights`);

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
