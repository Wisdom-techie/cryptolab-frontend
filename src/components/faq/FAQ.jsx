import { useState } from "react";
import "./FAQ.css";

const faqs = [
  {
    question: "What is Cryptolab?",
    answer:
      "Cryptolab is a modern crypto brokerage platform that allows users to buy, manage, and monitor digital assets securely.",
  },
  {
    question: "How can I buy cryptocurrency on Cryptolab?",
    answer:
      "You can buy cryptocurrency by selecting an asset, entering the amount, and choosing a payment method directly on the platform.",
  },
  {
    question: "Is Cryptolab secure?",
    answer:
      "Yes. Cryptolab uses secure authentication, encrypted data storage, and follows best practices to protect user data and funds.",
  },
  {
    question: "Can I track crypto prices in real time?",
    answer:
      "Yes. Cryptolab provides market price tracking and updates to help users make informed decisions.",
  },
  {
    question: "Does Cryptolab support refunds?",
    answer:
      "Yes. Cryptolab allows controlled refund flows handled by the platform administrator.",
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <h2>Frequently Asked Questions</h2>

      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div className="faq-item" key={index}>
            <div
              className="faq-question"
              onClick={() => toggleFAQ(index)}
            >
              <span>{faq.question}</span>
              <span className="icon">
                {activeIndex === index ? "−" : "+"}
              </span>
            </div>

            {activeIndex === index && (
              <div className="faq-answer">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
