import "./InfoCards.css";

const cards = [
  {
    title: "Crypto Trading Guide",
    description:
      "Learn the basics of cryptocurrency trading, market trends, and strategies to trade confidently.",
  },
  {
    title: "Latest Crypto News",
    description:
      "Stay updated with the latest news, announcements, and market movements in the crypto space.",
  },
  {
    title: "Stay Safe & Secure",
    description:
      "Understand best security practices to protect your assets and avoid common crypto scams.",
  },
  {
    title: "Cryptopedia",
    description:
      "Explore crypto terms, blockchain concepts, and everything you need to know about digital assets.",
  },
];

export default function InfoCards() {
  return (
    <section className="info-section">
      <div className="info-grid">
        {cards.map((card, index) => (
          <div className="info-card" key={index}>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
