// components/SolanaPayButton.js
'use client'; // Required for Next.js to treat this as a Client Component

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import { Keypair } from '@solana/web3.js';

export default function SolanaPayButton() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [qrCode, setQrCode] = useState(null);
  const [paid, setPaid] = useState(false);

  // Function to create the payment request
  const createPayment = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first!');
      return;
    }

    // In a REAL app, this would be the merchant's wallet address.
    // For this demo, we'll just use the user's own address (so they pay themselves).
    const recipient = publicKey;
    const amount = 1; // 1 USDC
    const reference = new Keypair().publicKey; // A unique ID for this transaction

    // Create the Solana Pay URL
    const url = `solana:${recipient}?amount=${amount}&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&reference=${reference}&label=AfricaWeb3Hub+Demo`;

    // For now, we'll just display the URL as text.
    // In a real app, you would use a library like 'qrcode' to generate a QR code image.
    setQrCode(url);
    setPaid(false); // Reset paid status

    // Now, let's listen for the transaction
    const interval = setInterval(async () => {
      try {
        // Check the blockchain for any transactions with our unique reference
        const signatures = await connection.getSignaturesForAddress(reference);
        if (signatures.length > 0) {
          clearInterval(interval); // Stop checking
          setPaid(true); // Mark as paid
          alert('Payment Received! Thank you! 🎉');
        }
      } catch (error) {
        console.error('Error checking for payment:', error);
      }
    }, 1000); // Check every second
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>AfricaWeb3Hub Solana Pay Demo</h1>
      <p>Experience a simple Solana Pay transaction on Devnet.</p>

      {/* Wallet Connect Button */}
      <div style={{ marginBottom: '20px' }}>
        <WalletMultiButton />
      </div>

      {/* Button to Generate Payment */}
      <button
        onClick={createPayment}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#14F195',
          color: 'black',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
        disabled={!publicKey} // Disable if wallet isn't connected
      >
        Generate Payment Request (1 USDC)
      </button>

      {/* Display the QR Code / Payment Link */}
      {qrCode && !paid && (
        <div>
          <h3>Scan or Use This Link to Pay</h3>
          {/* This is where a QR code would go. For now, we show the URL. */}
          <p style={{
            wordBreak: 'break-all',
            padding: '10px',
            backgroundColor: '#f0f0f0',
            borderRadius: '5px'
          }}>
            {qrCode}
          </p>
          <p><i>For now, copy this URL into your Phantom wallet browser to pay.</i></p>
        </div>
      )}

      {/* Show a success message after payment */}
      {paid && (
        <div>
          <h2 style={{ color: 'green' }}>✅ Payment Confirmed!</h2>
          <p>This proves the Solana Pay flow works!</p>
        </div>
      )}
    </div>
  );
}
