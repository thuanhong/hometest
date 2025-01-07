### 1. Redundant Property for FormattedWalletBalance

interface WalletBalance {
    currency: string;
    amount: number;
}

interface FormattedWalletBalance {
    currency: string;
    amount: number;
    formatted: string;
}

Both `WalletBalance` and `FormattedWalletBalance` have `amount` and `currency` properties, so we can refactor them using extends.

```
interface WalletBalance {
    currency: string;
    amount: number;
}

interface FormattedWalletBalance extends WalletBalance {
    formatted: string;
}
```

### 2. Naming Convenient

```
interface Props extends BoxProps {

}
const WalletPage: React.FC<Props> = (props: Props) => {
```

`Props` can be renamed here for readability.

```
interface WalletPageProps extends BoxProps {

}
const WalletPage: React.FC<WalletPageProps> = (props: WalletPageProps) => {
```

### 3. Use mapping condition object

```
const getPriority = (blockchain: any): number => {
    switch (blockchain) {
    case 'Osmosis':
        return 100
    case 'Ethereum':
        return 50
    case 'Arbitrum':
        return 30
    case 'Zilliqa':
        return 20
    case 'Neo':
        return 20
    default:
        return -99
    }
}
```

This function can use object condition mapping.

```
const getPriority = (blockchain: string): number => {
    const priorities: Record<string, number> = {
        Osmosis: 100,
        Ethereum: 50,
        Arbitrum: 30,
        Zilliqa: 20,
        Neo: 20,
    };
    return priorities[blockchain] || -99;
};
```

### 4. Inefficient Filtering and Sorting Logic

```
const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
            const balancePriority = getPriority(balance.blockchain);
            if (lhsPriority > -99) {
                if (balance.amount <= 0) {
                    return true;
                }
            }
            return false
        }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
            const leftPriority = getPriority(lhs.blockchain);
            const rightPriority = getPriority(rhs.blockchain);
            if (leftPriority > rightPriority) {
                return -1;
            } else if (rightPriority > leftPriority) {
                return 1;
        }
    });
}, [balances, prices]);
```

`lhsPriority` is used but undeclared.

Missing cases for `balancePriority > -99` and `balance.amount > 0`, `leftPriority === rightPriority`

`prices` in the dependencies array is redundant cause it is not used to calculate in this `useMemo`

Refactor ====>

```
const sortedBalances = useMemo(() => {
    return balances
        .filter((balance: WalletBalance) => {
            const balancePriority = getPriority(balance.blockchain);
            return balancePriority > -99 && balance.amount > 0; // Correct filtering logic
        })
        .sort((lhs: WalletBalance, rhs: WalletBalance) => {
            return getPriority(rhs.blockchain) - getPriority(lhs.blockchain); // Simplified sorting logic
        });
}, [balances]);
```

### 5. Unused variable

```
const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
        ...balance,
        formatted: balance.amount.toFixed()
    }
})
```

===> remove it

### 6. Re-integrate mapping

```
const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
        <WalletRow
            className={classes.row}
            key={index}
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.formatted}
        />
    )
})
```

===>

```
const rows = sortedBalances.map((balance: WalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    const formattedAmount = balance.amount.toFixed(2);  // Specified decimal places cause without specifying the decimal places can lead to unexpected results
    return (
        <WalletRow
            className={classes.row}
            key={index}
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={formattedAmount}
        />
    );
});
```

### 7 Final result

```
interface WalletBalance {
    currency: string;
    amount: number;
    blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
    formatted: string;
}

interface WalletPageProps extends BoxProps {}

const WalletPage: React.FC<WalletPageProps> = (props: WalletPageProps) => {
    const { children, ...rest } = props;
    const balances = useWalletBalances();
    const prices = usePrices();

    const getPriority = (blockchain: string): number => {
        const priorities: Record<string, number> = {
            Osmosis: 100,
            Ethereum: 50,
            Arbitrum: 30,
            Zilliqa: 20,
            Neo: 20,
        };
        return priorities[blockchain] || -99;
    };

    const sortedBalances = useMemo(() => {
        return balances
            .filter((balance: WalletBalance) => {
                const balancePriority = getPriority(balance.blockchain);
                return balancePriority > -99 && balance.amount > 0;
            })
            .sort((lhs: WalletBalance, rhs: WalletBalance) => {
                return getPriority(rhs.blockchain) - getPriority(lhs.blockchain);
            });
    }, [balances]);

    const rows = sortedBalances.map((balance: WalletBalance, index: number) => {
        const usdValue = prices[balance.currency] * balance.amount;
        const formattedAmount = balance.amount.toFixed(2);
        return (
            <WalletRow
                className={classes.row}
                key={index}
                amount={balance.amount}
                usdValue={usdValue}
                formattedAmount={formattedAmount}
            />
        );
    });

    return (
        <div {...rest}>
            {rows}
        </div>
    );
};
```
