import { useState } from "react";
import { FiDroplet, FiMinusCircle } from "react-icons/fi";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Page } from "../../components/ui/Page.jsx";
import { DAILY_WATER_GOAL_ML, DEFAULT_WATER_AMOUNTS } from "../../constants/theme.js";
import { useCoupleData } from "../../context/CoupleDataContext.jsx";
import { useAnimatedNumber } from "../../hooks/useAnimatedNumber.js";
import { toDateKey } from "../../utils/date.js";
import styles from "./WaterTracker.module.css";

export function WaterTracker() {
  const { water, addWater, decreaseWater } = useCoupleData();
  const [customAmount, setCustomAmount] = useState(750);
  const todayAmount = water[toDateKey()] ?? 0;
  const progress = Math.min(Math.round((todayAmount / DAILY_WATER_GOAL_ML) * 100), 100);
  const animatedProgress = useAnimatedNumber(progress);
  const animatedAmount = useAnimatedNumber(todayAmount);

  return (
    <Page eyebrow="Hidrasyon" title="Su Takibi" description="Gerçekçi dolum animasyonlu 3D su balonu ile günlük hedef takibi.">
      <section className={styles.layout}>
        <Card className={styles.visualCard}>
          <div className={styles.orb} style={{ "--fill": `${animatedProgress}%` }}>
            <div className={styles.water}>
              <span className={styles.waveOne} />
              <span className={styles.waveTwo} />
            </div>
            <div className={styles.gloss} />
            <strong>{Math.round(animatedProgress)}%</strong>
            <small>{Math.round(animatedAmount)} ml / {DAILY_WATER_GOAL_ML} ml</small>
          </div>
        </Card>

        <Card className={styles.controls}>
          <h2>Su Ekle</h2>
          <div className={styles.amounts}>
            {DEFAULT_WATER_AMOUNTS.map((amount) => (
              <Button key={amount} onClick={() => addWater(amount)}>
                <FiDroplet />
                {amount}ml
              </Button>
            ))}
          </div>
          <label>
            Özel miktar
            <input
              min="50"
              step="50"
              type="number"
              value={customAmount}
              onChange={(event) => setCustomAmount(Number(event.target.value))}
            />
          </label>
          <Button variant="secondary" onClick={() => addWater(customAmount)}>
            Özel Miktar Ekle
          </Button>
          <Button className={styles.decreaseButton} variant="ghost" onClick={() => decreaseWater(100)}>
            <FiMinusCircle />
            100 ml Azalt
          </Button>
        </Card>
      </section>
    </Page>
  );
}
